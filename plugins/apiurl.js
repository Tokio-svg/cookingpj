import Vue from 'vue'

Vue.prototype.$apiUrl = {
  // laravel APIのアドレス
  url:"https://thawing-mountain-07325.herokuapp.com/",
  // ※ローカルサーバーの場合はこっち
  // url: "http://127.0.0.1:8000/",
  // XFREE APIのアドレス
  imgUrl: "http://h2iuu2ea.php.xdomain.jp/",
  // ※ローカルサーバーの場合はこっち
  // imgUrl: "http://localhost/xfree/",
}