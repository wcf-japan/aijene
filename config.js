// Teachable Machine設定
const CONFIG = {
    // Teachable MachineモデルのURL
    // 新しいモデルを作成したら、このURLを更新してください
    // 例: "https://teachablemachine.withgoogle.com/models/YOUR_NEW_MODEL_ID/"
    MODEL_URL: "https://teachablemachine.withgoogle.com/models/XytTNSgUE/",
    
    // クラス名（Teachable Machineで設定したクラス名に合わせて変更）
    // 実際のクラス名: "阿部輝", "お茶"
    CLASS_NAMES: [
        "阿部輝",
        "お茶"
    ],
    
    // 画像サイズ
    IMAGE_SIZE: 224,
    
    // 信頼度の閾値（この値以上で判定結果を表示）
    CONFIDENCE_THRESHOLD: 0.5
}; 