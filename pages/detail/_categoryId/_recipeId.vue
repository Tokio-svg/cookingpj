<template>
  <div class="container">
    <div v-if="loading">loading...</div>
    <div v-else>
      <h1>{{info.recipeTitle}}</h1>
      <div class="recipe_wrap">
        <div class="recipe_image">
          <img :src="info.foodImageUrl" alt="no image">
        </div>
        <div class="recipe_material">
          <div class="recipe_material-content">
            <h2>材料</h2>
            <p v-for="item in info.recipeMaterial" v-bind:key="item">{{item}}</p>
          </div>
        </div>
      </div>
      <a :href="info.recipeUrl">>> レシピの元メージへ（外部リンク）</a>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  layout: 'header_layout',
  data() {
    return {
      error: false,
      loading: true,
      info: [],
    }
  },
  // Apiから投稿情報を取得
  async mounted() {
    await axios
      .get(`https://app.rakuten.co.jp/services/api/Recipe/CategoryRanking/20170426?format=json&categoryId=${this.$route.params.categoryId}&elements=foodImageUrl%2CrecipeMaterial%2CrecipeUrl%2CrecipeTitle%2CrecipeId&applicationId=1095040277832397186`)
      .then((response) => {
          this.info = response.data.result.find(({recipeId})=> recipeId == this.$route.params.recipeId);
        })
      .catch((error) => {
        console.log(error);
        alert('エラーが発生しました。時間を置いて再度お試しください。');
        this.$router.push('/');
      })
      .finally(() => (this.loading = false));
  },
}
</script>

<style scoped>
.container {
  width: 80%;
  min-width: 900px;
  height: 80%;
  margin: auto;
}
h1 {
  font-size: 30px;
  text-align: center;
  margin: 20px auto;
}
h2 {
  font-size: 24px;
}
.recipe_wrap {
  display: flex;
  height: 90%;
  align-items: center;
}
.recipe_image,.recipe_material {
  width: 45%;
  min-height: 100%;
  background: rgb(255, 255, 255);
  margin: 10px auto 0;
}
.recipe_image img {
  width: 100%;
  max-height: 500px;
  margin: auto;
}
.recipe_material {
  min-width: fit-content;
  padding: 20px;
  border-radius: 20px;
  line-height: 1.5em;
}
.recipe_material-content {
  width: fit-content;
  margin: auto;
}
a {
  color: rgb(255, 131, 82);
  display: block;
  text-align: right;
  font-size: 18px;
}
</style>