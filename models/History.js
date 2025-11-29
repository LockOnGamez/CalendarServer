const mongoose = require('mongoose');

const HistorySchema = new mongoose.Schema({
    date: { type: Date, required: true }, // 날짜 (시간은 무시하고 날짜 위주)
    type: {
        type: String,
        required: true,
        enum: ['IN', 'OUT', 'PROD'] // 입고(초록), 출고(빨강), 생산(파랑)
    },
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' }, // 어떤 물건인지
    itemName: { type: String }, // 나중에 조회를 편하게 하기 위해 이름 백업
    changeAmount: { type: Number, required: true }, // 변동 수량 (+50, -10 등)
    finalStock: { type: Number }, // 변동 후 남은 재고 (검증용)
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('History', HistorySchema);