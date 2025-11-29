const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
        enum: ['원단', '지관', '점착제', '생산품'] // 오타 방지
    },
    name: { type: String, required: true }, // 화면에 보여줄 이름 (예: 청색 원단 38mic)

    // 세부 스펙 (카테고리별로 필요한 것만 저장)
    specs: {
        color: { type: String },        // 색상 (청색, 투명)
        thickness: { type: Number },    // 두께 (38, 40...)
        width: { type: Number },        // 폭 (1040, 1240...)
        length: { type: Number },       // 길이 (3000, 125...)
        coreType: { type: String },     // 지관타입
        adhesiveType: { type: String }  // 점착제타입
    },

    currentStock: { type: Number, default: 0 }, // 현재 재고량
    unit: { type: String, default: 'ea' } // 단위 (roll, kg 등)
});

module.exports = mongoose.model('Item', ItemSchema);