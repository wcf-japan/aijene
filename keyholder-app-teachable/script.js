
let model, webcam;
let teachableMachineModel = null;

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

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', async () => {
    log('アプリケーションが起動しました');
    log('Teachable Machineモデルを読み込み中...');
    
    // Teachable Machineモデルを読み込み
    await loadTeachableMachineModel();
    
    log('カメラを起動してから判定ボタンを押してください');
});

document.getElementById("start-camera").addEventListener("click", async () => {
    try {
        log("📷 カメラ起動開始...");
        const video = document.getElementById("webcam");
        webcam = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                width: { ideal: CONFIG.IMAGE_SIZE },
                height: { ideal: CONFIG.IMAGE_SIZE }
            } 
        });
        video.srcObject = webcam;
        video.style.display = "block";
        log("✅ カメラ起動成功！");
        log("カメラが起動しました。判定ボタンを押してください。");
    } catch (err) {
        log("❌ カメラ起動失敗: " + err.message);
        log("ブラウザのカメラ権限を確認してください。");
        console.error(err);
    }
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
        } else {
            log(`❓ 信頼度が低いため判定できません - 最高信頼度: ${(confidence * 100).toFixed(1)}%`);
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
