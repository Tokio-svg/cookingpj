<template>
  <header>
    <!-- <img v-bind:src="logoImage" class="header_logo"> -->
    <NuxtLink to="/">ホーム</NuxtLink>
    <div class="header_link" v-if="!$auth.loggedIn">
      <div class="header_link-content">
        <NuxtLink to="/register">新規登録</NuxtLink>
      </div>
      <div class="header_link-content">
        <NuxtLink to="/login">ログイン</NuxtLink>
      </div>
    </div>
    <div class="header_link" v-else>
      <p>こんにちは {{ $auth.user.name }}さん</p>
      <button v-on:click="logout">ログアウト</button>
    </div>
  </header>
</template>

<script>
// import axios from "axios";
export default {
  methods: {
    async logout() {
      if (!confirm('ログアウトします。よろしいですか？')) return;
      try {
        await this.$auth.logout();
        this.$router.push("/login");
      } catch (error) {
        console.log(error);
        alert('エラーが発生しました。時間を置いて再度お試しください。');
      }
    },
  },
  data() {
    return {
      // logoImage: require('@/assets/img/logo.png'),
    }
  },
}
</script>

<style scoped>
header {
  height: 70px;
  width: 100%;
  background: rgb(204, 255, 194);
  display: flex;
  justify-content: space-between;
  color: black;
  font-size: 20px;
}
.header_logo {
  height: 60%;
  margin: auto 20px;
}
.header_link {
  height: fit-content;
  margin: auto 100px;
  display: flex;
}
.header_link-content {
  margin-right: 30px;
}
</style>