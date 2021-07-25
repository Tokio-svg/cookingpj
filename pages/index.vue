<template>
  <div class="container">
    <div class="search_input-wrap">
      <validation-observer ref="obs" v-slot="ObserverProps">
        <validation-provider v-slot="ProviderProps" rules="required|max:20">
          <div class="error">{{ ProviderProps.errors[0] }}</div>
          <input type="text" class="seatch_input" v-model="search" placeholder="食材名を入力してください" name="検索欄">
        </validation-provider>
        <button class="search_button" v-on:click="searchRecipe"
        :disabled="ObserverProps.invalid || !ObserverProps.validated">検索</button>
      </validation-observer>
      <div class="button-wrap">
        <div>
          <button class="post_button" v-on:click="goPost" v-if="$auth.loggedIn">レシピ投稿画面へ</button>
        </div>
      </div>
    </div>
    <div class="list_wrap">
      <div>
        <img class="QRcode" src="/img/386mfwmq.png" alt="no_image">
        <p>↑Line Botはこちら</p>
      </div>
      <div class="search_list-wrap">
        <p class="list_title">楽天レシピ</p>
        <!-- ローディングインジケータ -->
        <vue-loading
          type="cylon"
          color="#aaa"
          :size="{ width: '80px', height: '80px' }"
          class="loading_indicater" v-show="loadingLeft"
        />
        <p v-show="searchResult.length === 0" class="noresult">{{resultMessage}}</p>
        <p v-show="searchResult.length != 0" class="noresult">"{{searchName}}"の検索結果</p>
        <div class="search_card-wrap">
          <div class="search_card" v-for="item in searchResult" v-bind:key="item.recipeId" v-on:click="select(searchCategoryId,item.recipeId)">
            <div class="card_image-container">
              <img :src="item.mediumImageUrl" alt="no image" class="card_image">
            </div>
            <p class="card_title">{{ item.recipeTitle }}</p>
          </div>
        </div>
      </div>
      <div class="save_list-wrap">
        <p class="list_title">投稿レシピ</p>
        <!-- ローディングインジケータ -->
        <vue-loading
          type="cylon"
          color="#aaa"
          :size="{ width: '80px', height: '80px' }"
          class="loading_indicater" v-show="loadingRight"
        />
        <!-- 検索結果 -->
        <p v-show="searchResultRight.length === 0" class="noresult">{{resultMessageRight}}</p>
        <!-- ページ情報 -->
        <div v-show="searchResultRight.length != 0" class="page_info">
          <p>"{{searchName}}"の検索結果：{{test.total}}件のレシピ</p>
          <!-- ページ移動リンク -->
          <button v-on:click="findPostRecipe(prevPageUrl)" class="prev_button">prev</button>
          <p>{{pageInfo}}</p>
          <button v-on:click="findPostRecipe(nextPageUrl)" class="next_button">next</button>
        </div>
        <div class="search_card-wrap" v-show="searchResultRight != []">
          <div class="search_card" v-for="item in searchResultRight" v-bind:key="item.id" v-on:click="selectRight(item.id)">
            <div class="card_image-container">
              <img  :src="getImagePath(item.img_path,item.id)" alt="no image" class="card_image" :id="`img${item.id}`">
            </div>
            <p class="card_title">{{ item.name }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import getGategoryList from "../static/js/category.js"
import axios from "axios";
export default {
  layout: 'header_layout',
  data() {
    return {
      loading: true,
      loadingRight: false,
      loadingLeft: false,
      // mediumカテゴリ情報
      categoryInfo: getGategoryList.getGategoryList,
      categoryApiUrl: "https://app.rakuten.co.jp/services/api/Recipe/CategoryList/20170426?format=json&categoryType=medium&elements=categoryId%2CcategoryName%2CparentCategoryId&applicationId=1095040277832397186",
      search: null,
      searchName: null,
      searchResult: [],
      searchCategoryId: null,
      searchResultRight: [],
      pageInfo: "",
      nextPageUrl: "",
      prevPageUrl: "",
      test: "",
      // laravel APIのアドレス
      ApiUrl: this.$apiUrl.url,
      // XFREE APIのアドレス
      imageApiUrl: this.$apiUrl.imgUrl,
      resultMessage: "",
      resultMessageRight: "",
    }
  },
  methods: {
    async searchRecipe() {
      if (!this.search) return;
      this.searchName = this.search;
      const category = this.categoryInfo.find((c)=> c.categoryName === this.search);
      if (!category) {
        this.resultMessage = `${this.searchName}カテゴリーは存在しません。`;
        this.searchResult = [];
        this.searchCategoryId = null;
      } else {
        this.loadingLeft = true;
        // 楽天レシピ検索
        await axios
          .get(`https://app.rakuten.co.jp/services/api/Recipe/CategoryRanking/20170426?format=json&categoryId=${category.parentCategoryId}-${category.categoryId}&elements=foodImageUrl%2CrecipeMaterial%2CrecipeUrl%2CrecipeTitle%2CmediumImageUrl%2CrecipeId&applicationId=1095040277832397186`)
          .then((response) => {
            this.searchResult = response.data.result;
            this.searchCategoryId = `${category.parentCategoryId}-${category.categoryId}`;
          })
          .catch((error) => {
            console.log(error);
            alert('エラーが発生しました。時間を置いて再度お試しください。');
          })
          .finally(this.loadingLeft=false);
      }
      // 登録レシピ検索
      this.loadingRight = true;
      this.findPostRecipe(`${this.ApiUrl}api/v1/search/${this.search}`);
    },
    // 投稿レシピからの検索処理
    async findPostRecipe(url) {
      await axios
        .get(url)
        .then((response) => {
          this.searchResultRight = response.data.data.data;
          this.test = response.data.data;
          this.pageInfo = `${this.test.current_page}/${this.test.last_page}`;
          this.prevPageUrl = this.test.prev_page_url;
          this.nextPageUrl = this.test.next_page_url;
          this.resultMessageRight = "";
          if (this.searchResultRight.length === 0) {
            this.resultMessageRight = "該当するレシピはありません。";
          }
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(this.loadingRight=false);
    },
    select(categoryId,recipeId) {
      this.$router.push(`detail/${categoryId}/${recipeId}`);
    },
    selectRight(id) {
      this.$router.push(`postdetail/${id}`);
    },
    goPost() {
      this.$router.push('/post');
    },
    // img_pathから画像ファイルのパスを返す
    getImagePath(path,id) {
      if (path === 'no_image.png') {
        return '/img/no_image.png';
      }
      else {
        let getRequest = new XMLHttpRequest();
        const getUrl = `${this.imageApiUrl}catch.php?file=${path}`
        getRequest.open('GET', getUrl);
        getRequest.send();
        // 通信が完了したらレスポンスをコンソールに出力する
        getRequest.addEventListener('readystatechange', () => {
          if (getRequest.readyState === 4 && getRequest.status === 200) {
            const element = document.querySelector(`#img${id}`);
            // base64形式のデータをimg属性のsrcにセット
            let img_base64_content = getRequest.response;
            // 該当するファイルが存在する場合はsrcに画像データをセット
            if (img_base64_content != 'not_exists') {
              element.src = "data:image/png;base64," + img_base64_content;
            }
            else {
              element.src = '/img/no_image.png';
            }
          }
        });
        return;
      }
    }
  }
}
</script>

<style scoped>
.search_input-wrap {
  width: 70%;
  min-width: 800px;
  margin: 20px auto;
  display: flex;
  justify-content: center;
}
.seatch_input {
  width: 400px;
  height: 40px;
  font-size: 20px;
  padding-left: 10px;
  border-radius: 10px;
  border: 2px solid rgb(167, 167, 167);
}
.search_button {
  width: 100px;
  height: 40px;
  border: none;
  background: rgb(255, 172, 17);
  color: white;
  font-size: 20px;
  cursor: pointer;
  box-shadow: 5px 5px 5px  rgb(190, 86, 48);
  transition: 0.5s;
  border-radius: 10px;
}
.search_button:hover {
  background: rgb(145, 41, 0);
}
.list_wrap {
  display: flex;
  width: fit-content;
  min-width: 800px;
  margin: 20px auto;
}
.search_list-wrap,.save_list-wrap {
  width: 400px;
  height: 470px;
  background: rgb(225, 254, 255);
  border-radius: 20px;
  margin: 0 20px;
  padding: 20px;
}
.search_card-wrap {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}
.search_card {
  width: 150px;
  height: 200px;
  background: white;
  border-radius: 15px;
  margin: 10px;
  cursor: pointer;
}
.card_image-container {
  width: 150px;
  height: 120px;
  background: rgb(221, 221, 221);
  border-top-left-radius: 15px;
  border-top-right-radius: 15px;
}
.card_image {
  width: 100%;
  height: 100%;
  border-top-left-radius: 15px;
  border-top-right-radius: 15px;
}
.card_title {
  padding: 5px 10px;
}
.list_title {
  font-size: 24px;
  text-align: center;
}
.button-wrap {
  margin: auto 0;
}
.post_button {
  width: 100%;
  height: 40px;
  margin: auto 0 auto 20px;
  border-radius: 10px;
  border: none;
  color: white;
  background: rgb(0, 224, 224);
  font-size: 20px;
  cursor: pointer;
  transition: 0.5s;
  box-shadow: 5px 5px 5px  rgb(37, 133, 150);
  margin-left: 60px;
}
.post_button:hover {
  background: rgb(0, 153, 153);
}
.page_info {
  display: flex;
  justify-content: center;
}
.error {
  color: red;
}
.noresult {
  margin-top: 10px;
  text-align: center;
}
.QRcode {
  width: 100px;
  height: 100px;
}
</style>