<template>
  <div class="container">
    <!-- {{$auth.user}} -->
    <h1>レシピ投稿</h1>
    <div class="recipe_wrap">
      <div class="input">
        <!-- レシピ投稿用のバリデーション -->
          <h3>レシピ名</h3>
          <validation-provider v-slot="ProviderProps" rules="required|max:20">
            <div class="error">{{ ProviderProps.errors[0] }}</div>
            <input type="text" v-model="name" name="レシピ名">
          </validation-provider>
          <h3>カテゴリー</h3>
          <validation-provider v-slot="ProviderProps" rules="required|max:20">
            <div class="error">{{ ProviderProps.errors[0] }}</div>
            <input type="text" v-model="category" name="カテゴリー名">
          </validation-provider>
          <h3>画像</h3>
          <p v-show="imgMessage" class="error">{{imgMessage}}</p>
          <input type="file" v-on:change="confirmImage" id="img">
          <div class="material_wrap">
            <h3>材料</h3>
            <!-- 材料追加用のバリデーション -->
            <validation-observer ref="obs" v-slot="ObserverProps">
              <validation-provider v-slot="ProviderProps" rules="required|max:20">
                <div class="error">{{ ProviderProps.errors[0] }}</div>
                <input type="text" v-model="inputMaterial" name="材料名" placeholder="材料名">
              </validation-provider>
              <validation-provider v-slot="ProviderProps" rules="required|max:20">
                <div class="error">{{ ProviderProps.errors[0] }}</div>
                <input type="text" v-model="inputQuantity" name="分量" placeholder="分量">
              </validation-provider>
              <button class="add_button" v-on:click="addMaterial" :disabled="ObserverProps.invalid || !ObserverProps.validated">材料追加</button>
            </validation-observer>
          </div>
          <h3>手順</h3>
          <!-- 手順追加用のバリデーション -->
          <validation-observer ref="obs" v-slot="ObserverProps">
            <validation-provider v-slot="ProviderProps" rules="required|max:120">
              <div class="error">{{ ProviderProps.errors[0] }}</div>
              <textarea name="手順" id="" v-model="inputProcess"></textarea>
            </validation-provider>
            <button class="add_button" v-on:click="addProcess" :disabled="ObserverProps.invalid || !ObserverProps.validated">手順追加</button>
          </validation-observer>
          <div>
            <button v-on:click="sendRecipe" :disabled="!formCheck" v-show="!loading">レシピ登録</button>
            <!-- ローディングインジケータ -->
            <vue-loading
              type="cylon"
              color="#aaa"
              :size="{ width: '40px', height: '40px' }"
              v-show="loading"
            />
          </div>
      </div>
      <div class="display">
        <h2>{{name}}</h2>
        <h3>カテゴリー：{{category}}</h3>
        <div class="display_container">
          <div class="image_wrap">
            <p v-show="confirmedImage">
              <img class="confirmed_img" :src="confirmedImage" />
            </p>
          </div>
          <div class="material_list">
            <h3>材料</h3>
            <ul>
              <li v-for="(item,index) in materials" :key="index">
                <p>{{item.material}} {{item.quantity}}</p>
                <button v-on:click="upMaterial(index)">↑</button>
                <button v-on:click="downMaterial(index)">↓</button>
                <button v-on:click="deleteMaterial(index)">削除</button>
              </li>
            </ul>
          </div>
          <div class="process_list">
            <h3>手順</h3>
            <ol>
              <li v-for="(item,index) in processes" :key="index">
                <p>{{item}}</p>
                <button v-on:click="upProcess(index)">↑</button>
                <button v-on:click="downProcess(index)">↓</button>
                <button v-on:click="deleteProcess(index)">削除</button>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
export default {
  layout: 'header_layout',
  data() {
    return {
      // laravel APIのアドレス
      ApiUrl:`${this.$apiUrl.url}api/v1/recipe`,
      // XFREE APIのアドレス
      imageApiUrl: this.$apiUrl.imgUrl,
      name: null,
      category: null,
      inputMaterial: null,
      materials: [],
      inputQuantity: null,
      inputProcess: null,
      processes: [],
      file: "",
      imgPath: "no_image.png",
      confirmedImage: null,
      imgMessage: "",
      loading: false,
    }
  },
  created() {
    if (!this.$auth.loggedIn) {
      this.$router.push('/');
    }
  },
  computed: {
    formCheck: function() {
      if (!this.name || !this.category) {
        return false;
      }
      return true;
    }
  },
  methods: {
    addMaterial() {
      if (!this.inputMaterial || !this.inputQuantity) return;
      this.materials.push({material: this.inputMaterial, quantity: this.inputQuantity});
      this.inputMaterial = null;
      this.inputQuantity = null;
    },
    addProcess() {
      if (!this.inputProcess) return;
      this.processes.push(this.inputProcess);
      this.inputProcess = null;
    },
    async sendRecipe() {
      console.log(`this.file=${this.file}`);
      // 画像データをアップロード
      const formD = new FormData();
      formD.append("file", this.file);
      let request = new XMLHttpRequest();
      const url = `${this.imageApiUrl}catch.php`;
      // レスポンスを待ってPOST送信
      request.open('POST', url,false);
      await request.send(formD);
      // 画像が正常にアップロードされたらrequest.responseからパスを取得
      // errorが帰ってきた場合はno_imageのパスを格納
      if (request.response != 'error' && request.response != "") {
        this.imgPath = request.response;
      }
      else {
        this.imgPath = 'no_image.png';
      }
      console.log(`response=${request.response}`);
      // レシピ情報をAPIに送信
      const formData = new FormData();
      formData.append('recipe_name',this.name);
      formData.append('category',this.category);
      formData.append('image_path',this.imgPath);
      formData.append('userId',this.$auth.user.id);

      // materialsとprocessesは文字列に変換して格納する
      let items = JSON.stringify(this.materials);
      formData.append('materials',items);
      items = JSON.stringify(this.processes);
      formData.append('processes',items);

      this.loading = true;
      await axios.post(this.ApiUrl,formData)
      .then(() => {
        alert("レシピを投稿しました");
        this.name = null;
        this.category = null;
        this.materials = [];
        this.processes = [];
      })
      .catch((error) => {
          console.log(error);
          alert("投稿に失敗しました。時間を置いて再度お試しください。");
      })
      .finally(() => {
        this.loading = false;
        this.$router.push('/');
      });
    },
    // 画像ファイル情報を取得
    confirmImage(e) {
      this.imgMessage = "";
      this.file = e.target.files[0];
      if (!this.file.type.match("image.*")) {
        this.imgMessage = "画像ファイルを選択して下さい";
        this.file = null;
        this.confirmedImage = "";
        let obj = document.getElementById('img');
        obj.value = "";
        return;
      }
      this.createImage(this.file);
    },
    // 確認用画像ファイル読み込み
    createImage(file) {
      let reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = e => {
        this.confirmedImage = e.target.result;
        this.file = e.target.result;
      }
    },
    // 材料リスト上移動
    upMaterial(index) {
      if (index === 0) return;
      // 一つ前の内容を一時変数に格納
      const temp = this.materials[index-1];
      // 一つ前の内容をindex番目の内容に書き換え
      this.materials.splice(index-1,1,this.materials[index]);
      // 一時変数の内容をindex番目に書き換え
      this.materials.splice(index,1,temp);
    },
    // 材料リスト下移動
    downMaterial(index) {
      // this.materialsの要素数をカウント
      if (index >= this.materials.length-1) return;
      // 一つ後の内容を一時変数に格納
      const temp = this.materials[index+1];
      // 一つ後の内容をindex番目の内容に書き換え
      this.materials.splice(index+1,1,this.materials[index]);
      // 一時変数の内容をindex番目に書き換え
      this.materials.splice(index,1,temp);
    },
    // 材料リスト削除
    deleteMaterial(index) {
      this.materials.splice(index,1);
    },
    // 手順リスト上移動
    upProcess(index) {
      if (index === 0) return;
      // 一つ前の内容を一時変数に格納
      const temp = this.processes[index-1];
      // 一つ前の内容をindex番目の内容に書き換え
      this.processes.splice(index-1,1,this.processes[index]);
      // 一時変数の内容をindex番目に書き換え
      this.processes.splice(index,1,temp);
    },
    // 手順リスト下移動
    downProcess(index) {
      // this.processesの要素数をカウント
      if (index >= this.processes.length-1) return;
      // 一つ後の内容を一時変数に格納
      const temp = this.processes[index+1];
      // 一つ後の内容をindex番目の内容に書き換え
      this.processes.splice(index+1,1,this.processes[index]);
      // 一時変数の内容をindex番目に書き換え
      this.processes.splice(index,1,temp);
    },
    // 手順リスト削除
    deleteProcess(index) {
      this.processes.splice(index,1);
    },
  }
}
</script>

<style scoped>
.container {
  width: 90%;
  min-width: 800px;
  margin: 0px auto;
  min-height: 80%;
  line-height: 1.5em;
}
h1 {
  font-size: 30px;
  text-align: center;
  /* margin-top: 10px; */
  margin-bottom: 10px;
}
h4 {
  font-size: 13px;
}
.recipe_wrap {
  display: flex;
  height: 90%;
  justify-content: center;
}
.input,.display {
  width: 20%;
  background: white;
  margin: auto 10px;
  min-height: 500px;
  border-radius: 15px;
  padding: 20px 40px;
}
.display {
  width: 50%;
  background: rgb(225, 254, 255);
}
.display_container {
  display: flex;
}
input {
  border: 2px solid rgb(187, 187, 187);
  width: 100%;
  height: 25px;
  font-size: 18px;
  border-radius: 10px;
}
#img {
  border-radius: 0;
  border: none;
  font-size: 14px;
}
.material_wrap {
  border: 2px solid paleturquoise;
  width: 90%;
  margin: 5px 0;
  padding: 0 10px;
}
.material_wrap input {
  width: 80%;
  padding-left: 10px;
  font-size: 14px;
  margin-bottom: 10px;
  margin-left: auto;
}
textarea {
  border: 2px solid rgb(187, 187, 187);
  width: 100%;
  height: 60px;
  font-size: 16px;
  border-radius: 10px;
}
.error {
  color: red;
}
.confirmed_img {
  width: 90%;
}
.add_button {
  margin: 5px 0;
  border: none;
  border-radius: 15px;
  width: 80px;
  height: 30px;
  margin-left: auto;
  display: block;
}
.image_wrap {
  min-width: 40%;
}
.material_list,.process_list {
  min-width: 30%;
}
</style>