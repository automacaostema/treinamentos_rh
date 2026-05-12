const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const { formatData } = require('./utils');


// --- ROUTES: TREINAMENTOS ---
app.get('/api/treinamentos', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM treinamentos ORDER BY created_at DESC');
        res.json(formatData(rows));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/treinamentos', async (req, res) => {
    try {
        const t = req.body;
        const [result] = await pool.query(
            `INSERT INTO treinamentos 
            (tipo, atividade, duracao_horas, responsavel, data_programada, data_realizada, participantes, 
             dias_eficacia, vencimento_eficacia, criterios, responsavel_aval, eficacia_concluida, 
             descricao_atividade, num_doc, arquivado) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                t.tipo, t.atividade, t.duracao_horas, t.responsavel, t.data_programada || "", t.data_realizada || "",
                JSON.stringify(t.participantes || []), t.dias_eficacia || "", t.vencimento_eficacia || "",
                t.criterios || "", t.responsavel_aval || "", t.eficacia_concluida ? 1 : 0,
                t.descricao_atividade || "", t.num_doc || "", t.arquivado ? 1 : 0
            ]
        );
        res.status(201).json({ id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/treinamentos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        // Dynamic build of update query (simplified for this specific use case)
        const fields = [];
        const values = [];
        
        for (let key in updates) {
            if (key === 'id' || key === 'created_at') continue;
            fields.push(`${key} = ?`);
            let val = updates[key];
            if (key === 'participantes') val = JSON.stringify(val);
            if (typeof val === 'boolean') val = val ? 1 : 0;
            values.push(val);
        }
        
        values.push(id);
        await pool.query(`UPDATE treinamentos SET ${fields.join(', ')} WHERE id = ?`, values);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/treinamentos/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM treinamentos WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- ROUTES: PROGRAMADOS ---
app.get('/api/programados', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM treinamentos_programados ORDER BY created_at DESC');
        res.json(formatData(rows));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/programados', async (req, res) => {
    try {
        const t = req.body;
        const [result] = await pool.query(
            `INSERT INTO treinamentos_programados (tipo, atividade, duracao_horas, responsavel, data_programada, participantes) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [t.tipo, t.atividade, t.duracao_horas, t.responsavel, t.data_programada, JSON.stringify(t.participantes || [])]
        );
        res.status(201).json({ id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/programados/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM treinamentos_programados WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Servidor rodando em http://localhost:${PORT}`);
    });
}

module.exports = { app, pool };


