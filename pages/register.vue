<template>
  <div class="container">
    <div class="card_wrap">
      <h1>新規登録</h1>
      <validation-observer ref="obs" v-slot="ObserverProps">
        <div>
          <validation-provider v-slot="ProviderProps" rules="required|max:20">
            <div class="error">{{ ProviderProps.errors[0] }}</div>
            <input type="text" v-model="name" placeholder="ユーザーネーム" name="ユーザーネーム">
          </validation-provider>
        </div>
        <div>
          <validation-provider v-slot="ProviderProps" rules="required|email">
            <div class="error">{{ ProviderProps.errors[0] }}</div>
            <input type="text" v-model="email" placeholder="メールアドレス" name="メールアドレス">
          </validation-provider>
        </div>
        <div>
          <validation-provider v-slot="ProviderProps" rules="required|min:6">
            <div class="error">{{ ProviderProps.errors[0] }}</div>
            <input type="text" v-model="password" placeholder="パスワード" name="パスワード">
          </validation-provider>
        </div>
        <div>
          <button class="register_button" v-on:click="register"
          :disabled="ObserverProps.invalid || !ObserverProps.validated">新規登録</button>
        </div>
      </validation-observer>
      <div>
        <button class="login_button" v-on:click="goLogin">ログイン画面へ</button>
      </div>
      <div>
        <button class="guest_button" v-on:click="guestIn">ゲストとして参加</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
export default {
  // layout: 'header_layout',
  auth: false,
  data() {
    return {
      name: null,
      email: null,
      password: null,
      // laravel APIのアドレス
      ApiUrl: this.$apiUrl.url,
    }
  },
  methods: {
    async register() {
      try {
        await axios.post(`${this.ApiUrl}api/auth/register`, {
        name: this.name,
        email: this.email,
        password: this.password,
        });
        console.log('ok');
        this.$router.push("/login");
      } catch {
        alert("メールアドレスが既に登録されています。");
      }
    },
    async guestIn() {
      if (this.$auth.loggedIn) {
        try {
          await this.$auth.logout();
          this.$router.push("/");
        } catch (error) {
          console.log(error);
        };
      } else {
        this.$router.push("/");
      }
    },
    goLogin() {
      this.$router.push("/login");
    }
  }
}
</script>

<style scoped>
.container {
  position: relative;
  height: 100%;
  background: rgb(255, 239, 227);
}
h1 {
  font-size: 20px;
  margin-bottom: 10px;
}
.card_wrap {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%,-60%);
  width: fit-content;
  padding: 40px;
  background: white;
  border-radius: 10px;
  text-align: center;
}
input {
  padding: 0 10px;
  width: 250px;
  height: 50px;
  margin-bottom: 15px;
  border-radius: 10px;
  border: 1px solid rgb(168, 168, 168);
  font-size: 16px;
}
button {
  padding: 10px 20px;
  border-radius: 25px;
  border: none;
  cursor: pointer;
}
.register_button {
  margin: 10px;
  background: rgb(124, 165, 255);
}
.guest_button {
  margin-top: 10px;
  background: rgb(255, 167, 167);
}
.login_button {
  background: rgb(216, 255, 193);
}
.error {
  color: red;
}
</style>