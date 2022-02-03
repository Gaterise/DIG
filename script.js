"use strict"

/**
 * 使用するカメラを判断する関数
 * @returns {Object|String} //スマホならリアカメラ、それ以外ならフロントカメラのコードを返す
 */
function useCamera() {
	if (navigator.userAgent.match(/iPhone|Android.+Mobile/)) {
	  	return "environment";
	  	// return "user";
	} else {
	  	return "user";
	  	// return { exact: "environment" };;
	}
}

/**
 * requestAnimationFrameで
 * @returns {function} 
 */
function qrReading() {
	loadingMessage.innerText = "⌛ カメラを準備中..."
	if (video.readyState === video.HAVE_ENOUGH_DATA) { // カメラの準備が出来たらtrueになる
		loadingMessage.hidden = true; 
		canvasElement.hidden = false; // canvasを表示する(カメラ映像)
		canvasElement.height = video.videoHeight; // canvas要素の高さをビデオの高さにする　
		canvasElement.width = video.videoWidth; // canvas要素の幅をビデオの幅にする
		canvas.drawImage(video, 0, 0); // カメラ映像をcanvasに表示（引数:image,x座標,y座標）

		/**
		 * 指定されたキャンバスの長方形の画像データを含むImageDataオブジェクトを格納
		 * @type {object}
		 */
		const imageData = canvas.getImageData(
			0, // ImageDataが抽出される 長方形の左上隅のx軸座標
			0, // ImageDataが抽出される 長方形の左上隅のy軸座標
			canvasElement.width, // ImageDataが抽出される長方形の幅,正の値は右側、負の値は左側
			canvasElement.height // ImageDataが抽出される長方形の高さ,正の値は下、負の値は上
		); 

		/**
		 * jsQR関数の返り値objectを格納（QRコードを認識した場合object、認識しない場合null）
		 * @type {object}
		 */
		const code = jsQR(
			imageData.data, // イメージデータ
			imageData.width, // イメージデータ幅
			imageData.height, // イメージデータ高さ
			{inversionAttempts: "dontInvert"}// オプションのinversionAttemptは後方互換性のためdontInvertにするとか…（無くてもデフォのattemptBothで動く）
		); 

		if (code !== null) {// QRコードを認識した場合
			if (code.data === "") return requestAnimationFrame(qrReading);// QRコードを誤認識してデータが空だった場合繰返し
			drawLine(code.location.topLeftCorner, code.location.topRightCorner);
			drawLine(code.location.topRightCorner, code.location.bottomRightCorner);
			drawLine(code.location.bottomRightCorner, code.location.bottomLeftCorner);
			drawLine(code.location.bottomLeftCorner, code.location.topLeftCorner);
			console.log(String(code.data));
			document.querySelector("#qrdata").value = String(code.data); // input要素にQRコードのデータを表示
		} 
	}
	return requestAnimationFrame(qrReading); // 繰返し
}

/**
 * canvas上に描画されたimageにあるQRコードの周りに線を引く関数
 * @param {object} begin {x: ?, y: ?}の形のオブジェクト
 * @param {object} end {x: ?, y: ?}の形のオブジェクト
 * @param {string} color カラーコード
 */
function drawLine(begin, end) {
	canvas.beginPath();
	console.log(canvas);
	canvas.moveTo(begin.x, begin.y);
	canvas.lineTo(end.x, end.y);
	canvas.lineWidth = 6; // 線の太さ
	canvas.strokeStyle = "#FF3B58"; // 線の色を指定（"文字列"blue"等でもOK"）
	canvas.stroke();
}

const loadingMessage = document.getElementById("loadingMessage");
const video = document.createElement("video");
const canvasElement = document.getElementById("canvas");		

/**
* 2Dグラフィックを描画するためのメソッドやプロパティを持つオブジェクトを格納
* @type {object}
*/
const canvas = canvasElement.getContext("2d");

// カメラ設定
const constraints = {
	audio: false,
	video: {
		width: canvas.width,
		height: canvas.height,
		facingMode: useCamera()
	}
  };

// Navigator.mediaDevices 読み取り専用プロパティは、カメラやマイク、画面共有のような接続されたメディア入力装置へのアクセスを提供する MediaDevices オブジェクトを返します。
// メディアデバイスの準備
navigator.mediaDevices.getUserMedia(constraints)
	.then(stream => {
	// console.log(stream);
	// console.log(video);
	video.srcObject = stream;
	video.setAttribute("playsinline", true); // videoに属性追加（これ無いとiphoneでカメラが正常起動しない）
	video.play();
	qrReading();
	}
);









