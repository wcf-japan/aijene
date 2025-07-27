// Teachable Machine設定
const CONFIG = {
    // Teachable MachineモデルのURL
    // このURLをあなたのモデルURLに変更してください
    MODEL_URL: "https://teachablemachine.withgoogle.com/models/fRAjirmVv/",
    
    // クラス名（Teachable Machineで設定したクラス名に合わせて変更）
    CLASS_NAMES: [
        "キーホルダーA",
        "キーホルダーB", 
        "キーホルダーC",
        "その他"
    ],
    
    // 画像サイズ
    IMAGE_SIZE: 224,
    
    // 信頼度の閾値（この値以上で判定結果を表示）
    CONFIDENCE_THRESHOLD: 0.5
}; 