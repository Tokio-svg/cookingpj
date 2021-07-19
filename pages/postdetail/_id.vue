<template>
  <div class="container">
    <!-- {{info}} -->
    <div v-if="loading">loading...</div>
    <div v-else>
      <h1>{{info.name}}</h1>
      <h3>投稿者：{{getUserInfo(info.user)}}さん</h3>
      <h3>投稿日：{{info.created_at}}</h3>
      <h3>カテゴリー：{{info.category}}</h3>
      <div class="recipe_wrap">
        <div class="recipe_image">
          <img :src="`${imgPath}`" alt="no image">
        </div>
        <div class="recipe_material">
          <h2>材料</h2>
          <ul>
            <li v-for="item in info.materials" v-bind:key="item.index">{{item.name}} ...... {{item.quantity}}</li>
          </ul>
        </div>
        <div class="recipe_material">
          <h2>手順</h2>
          <ol>
            <li v-for="item in info.processes" v-bind:key="item.index">{{item.content}}</li>
          </ol>
        </div>
      </div>
      <button class="delete_button" v-on:click="deleteRecipe" v-if="checkDelete">このレシピを削除する</button>
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
      imgPath: "",
      // laravel APIのアドレス
      ApiUrl: this.$apiUrl.url,
    }
  },
  // Apiから投稿情報を取得
  async mounted() {
    await axios
      .get(`${this.ApiUrl}api/v1/recipe/${this.$route.params.id}`)
      .then((response) => {
          this.info = response.data.data;
          this.imgPath = `${this.ApiUrl}${this.info.img_path}`;
        })
      .catch((error) => {
        console.log(error);
        alert('エラーが発生しました。時間を置いて再度お試しください。');
        this.$router.push('/');
      })
      .finally(() => (this.loading = false));
  },
  // レシピ削除処理
  methods: {
    async deleteRecipe() {
      if (!confirm('レシピを削除します。よろしいですか？')) return;
      await axios
        .delete(`${this.ApiUrl}api/v1/recipe/${this.$route.params.id}`)
        .catch((error) => {
          console.log(error);
          alert('エラーが発生しました。時間を置いて再度お試しください。');
          this.$router.push('/');
        })
        .finally(() => {
          this.$router.push('/')
        });
    },
    getUserInfo(user) {
      if (!user) return "";
      return user.name;
    },
  },
  computed: {
    checkDelete: function() {
      if (this.$auth.loggedIn) {
        if (this.$auth.user.id === this.info.user_id) return true;
      }
      return false;
    }
  }
}
</script>

<style scoped>
.container {
  width: 80%;
  min-width: 900px;
  min-height: 100%;
  margin: auto;
}
h1 {
  font-size: 30px;
  text-align: center;
  margin: 20px auto;
}
h2 {
  font-size: 18px;
}
.recipe_wrap {
  display: flex;
  min-height: 100%;
  align-items: center;
  justify-content: space-between;
}
.recipe_image,.recipe_material {
  width: 45%;
  height: 300px;
  background: rgb(255, 255, 255);
  margin: 10px auto 0;
}
.recipe_image img {
  width: 100%;
  max-height: 100%;
  margin: auto;
}
.recipe_material {
  width: 20%;
  padding: 20px 40px;
  border-radius: 15px;
  line-height: 1.5em;
}
ul {
  list-style: none;
}
.delete_button {
  border: none;
  cursor: pointer;
  width: 300px;
  height: 50px;
  border-radius: 25px;
  display: block;
  margin: 10px 0 0 auto;
  background: rgb(81, 119, 202);
  color: white;
}
</style>