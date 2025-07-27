
let model, webcam;
let teachableMachineModel = null;
let currentCamera = 'environment'; // 'environment' = 外カメラ, 'user' = 内カメラ

// TensorFlow.jsとTeachable Machineモデルを読み込み
async function loadTeachableMachineModel() {
    try {
        log("🤖 Teachable Machineモデルを読み込み中...");
        
        // 設定ファイルからモデルURLを取得
        const modelURL = CONFIG.MODEL_URL;
        
        // TensorFlow.jsを動的に読み込み
        if (!window.tf) {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest';
            document.head.appendChild(script);
            await new Promise(resolve => script.onload = resolve);
        }
        
        // Teachable Machineモデルを読み込み
        teachableMachineModel = await tf.loadLayersModel(modelURL + 'model.json');
        log("✅ Teachable Machineモデル読み込み完了！");
        return true;
    } catch (error) {
        log("❌ モデル読み込み失敗: " + error.message);
        log("⚠️ モデルURLを確認してください: " + CONFIG.MODEL_URL);
        return false;
    }
}

function log(message) {
    const logContent = document.querySelector('.log-content');
    const time = new Date().toLocaleTimeString();
    const logEntry = document.createElement('div');
    logEntry.innerHTML = `[${time}] ${message}`;
    logContent.appendChild(logEntry);
    logContent.scrollTop = logContent.scrollHeight;
    console.log(`[${time}] ${message}`);
}

// 判定結果を表示する関数
function displayResult(predictedClass, confidence) {
    const resultElement = document.getElementById('prediction-result');
    const confidenceFill = document.getElementById('confidence-fill');
    const confidenceText = document.getElementById('confidence-text');
    
    // 判定結果を表示
    resultElement.textContent = predictedClass;
    
    // 信頼度を表示
    const confidencePercent = (confidence * 100).toFixed(1);
    confidenceText.textContent = `${confidencePercent}%`;
    
    // 信頼度バーを更新
    confidenceFill.style.width = `${confidence * 100}%`;
    
    // 信頼度に応じて色を変更
    if (confidence >= 0.8) {
        confidenceFill.style.background = 'linear-gradient(45deg, #28a745, #20c997)';
        confidenceText.style.color = '#28a745';
    } else if (confidence >= 0.6) {
        confidenceFill.style.background = 'linear-gradient(45deg, #ffc107, #ffca2c)';
        confidenceText.style.color = '#ffc107';
    } else {
        confidenceFill.style.background = 'linear-gradient(45deg, #dc3545, #e74c3c)';
        confidenceText.style.color = '#dc3545';
    }
}

// 結果をリセットする関数
function resetResult() {
    const resultElement = document.getElementById('prediction-result');
    const confidenceFill = document.getElementById('confidence-fill');
    const confidenceText = document.getElementById('confidence-text');
    
    resultElement.textContent = '-';
    confidenceText.textContent = '-';
    confidenceFill.style.width = '0%';
    confidenceFill.style.background = 'linear-gradient(45deg, #28a745, #20c997)';
    confidenceText.style.color = '#28a745';
}

// カメラを起動する関数
async function startCamera(cameraType = 'environment') {
    try {
        log(`📷 カメラ起動開始... (${cameraType === 'environment' ? '外カメラ' : '内カメラ'})`);
        
        // 既存のストリームを停止
        if (webcam) {
            webcam.getTracks().forEach(track => track.stop());
        }
        
        const video = document.getElementById("webcam");
        
        // iPhone対応のカメラ設定
        const constraints = {
            video: {
                width: { ideal: CONFIG.IMAGE_SIZE },
                height: { ideal: CONFIG.IMAGE_SIZE },
                facingMode: cameraType, // 'environment' = 外カメラ, 'user' = 内カメラ
                // iPhoneでの安定性向上
                frameRate: { ideal: 30 },
                aspectRatio: { ideal: 1 }
            }
        };
        
        // カメラアクセスを試行
        webcam = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = webcam;
        
        // ビデオの読み込みを待つ
        await new Promise((resolve) => {
            video.onloadedmetadata = () => {
                video.style.display = "block";
                resolve();
            };
        });
        
        currentCamera = cameraType;
        log(`✅ カメラ起動成功！ (${cameraType === 'environment' ? '外カメラ' : '内カメラ'})`);
        
        // カメラ切替ボタンを表示
        document.getElementById("switch-camera").style.display = "inline-block";
        
        // 結果をリセット
        resetResult();
        
    } catch (err) {
        log("❌ カメラ起動失敗: " + err.message);
        
        // iPhoneでの一般的なエラー対処
        if (err.name === 'NotAllowedError') {
            log("⚠️ カメラ権限が拒否されました。ブラウザの設定を確認してください。");
        } else if (err.name === 'NotFoundError') {
            log("⚠️ カメラが見つかりません。デバイスにカメラがあるか確認してください。");
        } else if (err.name === 'NotSupportedError') {
            log("⚠️ このブラウザはカメラ機能をサポートしていません。Safariをお試しください。");
        } else {
            log("⚠️ 予期しないエラーが発生しました。ページを再読み込みしてください。");
        }
        
        console.error(err);
    }
}

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', async () => {
    log('アプリケーションが起動しました');
    log('デバイス: ' + (navigator.userAgent.includes('iPhone') ? 'iPhone' : 'その他'));
    log('ブラウザ: ' + navigator.userAgent.split(' ').pop());
    
    // iPhone用の追加設定
    if (navigator.userAgent.includes('iPhone')) {
        log('📱 iPhone検出: 最適化設定を適用中...');
        
        // タッチイベントの最適化
        document.addEventListener('touchstart', function() {}, {passive: true});
        document.addEventListener('touchmove', function() {}, {passive: true});
        
        // ズーム無効化
        document.addEventListener('gesturestart', function(e) {
            e.preventDefault();
        });
        document.addEventListener('gesturechange', function(e) {
            e.preventDefault();
        });
        document.addEventListener('gestureend', function(e) {
            e.preventDefault();
        });
    }
    
    // Teachable Machineモデルを読み込み
    await loadTeachableMachineModel();
    
    log('カメラを起動してから判定ボタンを押してください');
});

// カメラ起動ボタン
document.getElementById("start-camera").addEventListener("click", async () => {
    await startCamera('environment'); // デフォルトで外カメラ
});

// カメラ切替ボタン
document.getElementById("switch-camera").addEventListener("click", async () => {
    const newCamera = currentCamera === 'environment' ? 'user' : 'environment';
    await startCamera(newCamera);
});

document.getElementById("predict").addEventListener("click", async () => {
    try {
        log("🔍 判定ボタンが押されました");
        
        if (!webcam) {
            log("⚠️ カメラが起動していません。先にカメラを起動してください。");
            return;
        }
        
        if (!teachableMachineModel) {
            log("⚠️ Teachable Machineモデルが読み込まれていません。");
            return;
        }
        
        log("📸 画像を分析中...");
        
        // ビデオから画像を取得
        const video = document.getElementById("webcam");
        const canvas = document.createElement('canvas');
        canvas.width = CONFIG.IMAGE_SIZE;
        canvas.height = CONFIG.IMAGE_SIZE;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, CONFIG.IMAGE_SIZE, CONFIG.IMAGE_SIZE);
        
        // 画像をテンソルに変換
        const imageTensor = tf.browser.fromPixels(canvas);
        const normalizedImage = imageTensor.div(255.0);
        const batchedImage = normalizedImage.expandDims(0);
        
        // 予測実行
        const predictions = await teachableMachineModel.predict(batchedImage);
        const predictionArray = await predictions.array();
        
        // 結果を取得
        const maxIndex = predictionArray[0].indexOf(Math.max(...predictionArray[0]));
        const confidence = predictionArray[0][maxIndex];
        
        // 設定ファイルからクラス名を取得
        const predictedClass = CONFIG.CLASS_NAMES[maxIndex] || `クラス${maxIndex}`;
        
        // 信頼度チェック
        if (confidence >= CONFIG.CONFIDENCE_THRESHOLD) {
            log(`🎯 判定結果: ${predictedClass} - 信頼度: ${(confidence * 100).toFixed(1)}%`);
            displayResult(predictedClass, confidence);
        } else {
            log(`❓ 信頼度が低いため判定できません - 最高信頼度: ${(confidence * 100).toFixed(1)}%`);
            displayResult('判定できません', confidence);
        }
        
        // テンソルをクリーンアップ
        imageTensor.dispose();
        normalizedImage.dispose();
        batchedImage.dispose();
        predictions.dispose();
        
        log("判定が完了しました。再度判定する場合はボタンを押してください。");
        
    } catch (err) {
        log("❌ 判定中にエラー: " + err.message);
        console.error(err);
    }
});

// エラーハンドリング
window.addEventListener('error', (event) => {
    log("⚠️ 予期しないエラーが発生しました: " + event.error);
});

// ページ離脱時のクリーンアップ
window.addEventListener('beforeunload', () => {
    if (webcam) {
        webcam.getTracks().forEach(track => track.stop());
    }
});
