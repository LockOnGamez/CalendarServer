const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// 모델 불러오기
const Item = require('./models/Item');
const History = require('./models/History');

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB 연결
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected!'))
    .catch(err => console.log(err));

// ==========================================
// 1. 품목 등록 API (초기 세팅용)
// ==========================================
app.post('/api/items', async (req, res) => {
    try {
        // 프론트에서 보낸 { category, specs, name ... } 데이터를 저장
        const newItem = new Item(req.body);
        const savedItem = await newItem.save();
        res.status(201).json(savedItem);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// 2. 품목 조회 API (드롭다운 목록용)
// ==========================================
app.get('/api/items', async (req, res) => {
    try {
        const items = await Item.find();
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// 3. 트랜잭션 API (입고/출고/생산 발생 시) -> 핵심!
// ==========================================
app.post('/api/transaction', async (req, res) => {
    /*
      요청 데이터 예시:
      {
        "itemId": "64a...", 
        "type": "IN", 
        "amount": 100, 
        "date": "2024-05-20"
      }
    */
    const { itemId, type, amount, date } = req.body;

    try {
        // 1. 해당 아이템 찾기
        const item = await Item.findById(itemId);
        if (!item) return res.status(404).json({ msg: 'Item not found' });

        // 2. 재고 계산 (입고/생산이면 +, 출고면 -)
        let change = amount;
        if (type === 'OUT') change = -amount;
        // 생산(PROD)일 경우 완제품은 +, 원자재 소모 로직은 추후 추가(복잡도 줄이기 위함)

        item.currentStock += change;
        await item.save();

        // 3. 기록(History) 남기기 -> 캘린더를 위해 필수!
        const newHistory = new History({
            date: new Date(date),
            type: type,
            itemId: item._id,
            itemName: item.name,
            changeAmount: change,
            finalStock: item.currentStock
        });
        await newHistory.save();

        res.json({ msg: 'Transaction success', currentStock: item.currentStock });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// 4. 캘린더용 데이터 조회 API
// ==========================================
app.get('/api/calendar', async (req, res) => {
    try {
        // 모든 기록을 가져오되, 필요한 정보만 골라서 보냄
        const histories = await History.find().sort({ date: 1 });
        res.json(histories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));