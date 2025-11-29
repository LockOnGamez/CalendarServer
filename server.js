// server.js

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

// 환경 변수 (.env 파일) 로드
dotenv.config();

const app = express();
// Render 배포 시 Render가 환경 변수를 PORT에 지정해줍니다.
const PORT = process.env.PORT || 5000;

// 미들웨어 설정
app.use(cors()); // CORS 허용 (Flutter 앱과의 통신을 위해)
app.use(express.json());

// ===============================================
// 1. MongoDB 연결
// ===============================================

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Atlas에 성공적으로 연결되었습니다.'))
    .catch(err => {
        console.error('MongoDB 연결 오류:', err);
        process.exit(1);
    });


// ===============================================
// 2. 이벤트 데이터 모델 (Mongoose Schema)
// ===============================================

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    date: {
        type: Date, // 날짜 객체로 저장
        required: true,
    },
    description: {
        type: String,
        default: '일정 내용',
    },
}, { timestamps: true });

const Event = mongoose.model('Event', eventSchema);


// ===============================================
// 3. API 라우트 정의 (CRUD)
// ===============================================

// [POST] 이벤트 생성
app.post('/api/events', async (req, res) => {
    try {
        const { title, date, description } = req.body;

        if (!date || isNaN(new Date(date))) {
            return res.status(400).json({ message: '유효한 날짜 형식이 필요합니다.' });
        }

        const newEvent = new Event({
            title,
            date: new Date(date),
            description: description || '내용 없음',
        });

        await newEvent.save();
        res.status(201).json(newEvent);

    } catch (error) {
        console.error('이벤트 저장 오류:', error.message);
        res.status(500).json({ message: '이벤트 저장에 실패했습니다.' });
    }
});


// [GET] 모든 이벤트 조회
app.get('/api/events', async (req, res) => {
    try {
        // 모든 이벤트를 날짜 순으로 정렬하여 조회
        const events = await Event.find().sort({ date: 1 });
        res.status(200).json(events);
    } catch (error) {
        console.error('이벤트 조회 오류:', error.message);
        res.status(500).json({ message: '이벤트 조회에 실패했습니다.' });
    }
});


// 서버 상태 확인용 루트 경로
app.get('/', (req, res) => {
    res.status(200).send('캘린더 백엔드 서버가 정상 작동 중입니다.');
});


// ===============================================
// 4. 서버 실행
// ===============================================

app.listen(PORT, () => {
    console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});