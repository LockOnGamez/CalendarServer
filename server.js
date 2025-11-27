// server.js

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors'); // Flutter와 통신을 위해 CORS 설정

// 환경 변수 (.env 파일) 로드
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 미들웨어 설정
app.use(cors());
app.use(express.json()); // JSON 형식의 요청 본문을 파싱

// ===============================================
// 2. MongoDB 연결
// ===============================================

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Atlas에 성공적으로 연결되었습니다.'))
    .catch(err => {
        console.error('MongoDB 연결 오류:', err);
        process.exit(1); // 연결 실패 시 서버 종료
    });


// ===============================================
// 3. 이벤트 데이터 모델 (Mongoose Schema)
// ===============================================

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true, // 앞뒤 공백 제거
    },
    date: {
        type: Date,
        required: true,
    },
    description: {
        type: String,
        default: '일정 내용',
    },
    // 개인 캘린더이므로 user 필드는 일단 생략
}, { timestamps: true }); // 생성/수정 시간 자동 기록

const Event = mongoose.model('Event', eventSchema);


// ===============================================
// 4. API 라우트 정의
// ===============================================

// 1. 이벤트 생성 (POST 요청)
app.post('/api/events', async (req, res) => {
    try {
        const { title, date, description } = req.body;

        // 날짜 필드가 유효한지 확인
        if (!date || isNaN(new Date(date))) {
            return res.status(400).json({ message: '유효한 날짜 형식이 필요합니다.' });
        }

        const newEvent = new Event({
            title,
            // Flutter에서 ISO 8601 문자열로 날짜를 보내므로 Date 객체로 변환
            date: new Date(date),
            description: description || '내용 없음',
        });

        await newEvent.save();
        // 201 Created 응답과 저장된 이벤트 객체 반환
        res.status(201).json(newEvent);

    } catch (error) {
        console.error('이벤트 저장 오류:', error.message);
        res.status(500).json({ message: '이벤트 저장에 실패했습니다.' });
    }
});


// 2. 이벤트 조회 (GET 요청)
app.get('/api/events', async (req, res) => {
    try {
        // 모든 이벤트를 날짜 순으로 정렬하여 조회
        const events = await Event.find().sort({ date: 1 });

        // 성공 응답과 이벤트 목록 반환
        res.status(200).json(events);
    } catch (error) {
        console.error('이벤트 조회 오류:', error.message);
        res.status(500).json({ message: '이벤트 조회에 실패했습니다.' });
    }
});


// 서버 상태 확인용 루트 경로 (기존 코드 유지)
app.get('/', (req, res) => {
    res.status(200).send('캘린더 백엔드 서버가 정상 작동 중입니다.');
});


// ===============================================
// 5. 서버 실행
// ===============================================

app.listen(PORT, () => {
    console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});