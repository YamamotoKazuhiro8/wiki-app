// index.js

// モジュール
const path = require('path');
const express = require('express');
const mysql = require('mysql2/promise');
const { exit } = require('process');
require('dotenv').config();

// アプリ設定
const app = express();
const port = 3000;

// ミドルウェア設定
app.use(express.json());
app.use(express.static('public'));

// DB接続設定
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

// 検索ホームページを返す
app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

// title に対応するページを返す
// ブラウザから /page/xxx にアクセスしたとき page.html を返す
app.get('/page/:title', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public', 'page.html'));
});

app.get('/category/:name', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public', 'page.html'));
});

// API: 指定された title ページの内容（Markdown）をデータベースから取得して返す
app.get('/api/page/:title', async (req, res) => {
    const title = req.params.title;
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT content FROM pages WHERE title = ?', [title]);
        await connection.end();

        if (rows.length === 0) {
            return res.status(404).json({ status: 'error', message: 'ぺージが見つかりませんでした。' });
        }
        res.json({ status : 'success', content: rows[0].content });
  
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'サーバーエラー' });
    }
});

// API: 指定された title のページ内容を保存する（新規作成または上書き）
app.post('/api/page/:title', async (req, res) => {
    const title = req.params.title;
    const { content } = req.body;

    try {
        const connection = await mysql.createConnection(dbConfig);

        // 既に同じ title のページがあるか確認
        const [rows] = await connection.execute('SELECT id FROM pages WHERE title = ?', [title]);

        if (rows.length > 0) { 
            // 既存ページがある → 上書き保存
            await connection.execute('UPDATE pages SET content = ? WHERE title = ?', [content, title]);
        } else {
            // 新規ページ作成
            await connection.execute('INSERT INTO pages (title, content) VALUES (?, ?)', [title, content]);
        }

        await connection.end();
        res.json({ status: 'success', message: 'ページをセーブしました。' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status:'error', message: 'サーバーエラー' });
    }
});

// GET /api/search?keyword=apple
// GET /api/search?title=apple

// POST /api/search
// body:
// {
//   type: "keyword",  // "title", "tag", "category", "series"
//   keyword: "apple",
//   tags: ["fruit", "red"],
// }
app.post('/api/search', async (req, res) => {
    try {
        const { type, keyword, tag } = req.body;
        console.log('受信:', { type, keyword, tag });


        const connection = await mysql.createConnection(dbConfig);
        
        if(type ==='tag') {
            const [rows] = await connection.execute('SELECT id,name FROM tags WHERE name Like ?', [`%${keyword}%`]);
        
            if(rows.length === 0) {
                return res.json({status: 'noData', message:'not found'});
            }

            // 優先度でソート


            // Mapに変換
            const resultObj = {};
            rows.forEach(row => {
                resultObj[row.id] = row.name;
            });

            return res.json({ results: resultObj });
        } else if(type === 'title') {

            // 1.title も tagもない時
            //    全ページをソートして返す
            // 2.titleなし tagあり
            //    タグの付くページを返す
            // 3.titleあり tagなし
            // 4.titleあり tagあり

            // ページ検索（キーワード＆タグ）
            

            const conditions = []; // whereの後
            const params = [];     // executeに用いる

            if (keyword) {
                conditions.push('title LIKE ?');
                params.push(`%${keyword}%`);
            }

            if (tag) {
                conditions.push('EXISTS (SELECT 1 FROM page_tags pt WHERE pt.page_id = pages.id AND pt.tag_id = ?)');
                params.push(tag);
            }

            const query = `
                SELECT id, title FROM pages 
                WHERE ${conditions.join(' AND ')}
            `;

            [rows] = await connection.execute(query, params);

            if (rows.length === 0) {
                return res.json({ status: 'noData', message: 'ページが見つかりませんでした。' });
            }

            const resultObj = {};
            rows.forEach(row => {
                resultObj[row.id] = row.title;
            });

            return res.json({ results: resultObj });
        }

        return res.json({status:'error:',message:'undefinedな検索'});
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'サーバーエラー' });
    }
});

app.listen(port, () => {
    console.log(`Server http://localhost:${port}`);
});
