<template>
  <div class="container">
    <div class="card_wrap">
      <h1>ログイン</h1>
      <validation-observer ref="obs" v-slot="ObserverProps">
        <!-- ローディング -->
        <vue-loading
          type="spiningDubbles"
          color="#aaa"
          :size="{ width: '80px', height: '80px' }"
          class="loading_indicater" v-show="loading"
        />
        <div v-show="!loading">
          <div>
            <validation-provider v-slot="ProviderProps" rules="required">
              <div class="error">{{ ProviderProps.errors[0] }}</div>
              <input type="text" v-model="email" placeholder="メールアドレス" name="メールアドレス">
            </validation-provider>
          </div>
          <div>
            <validation-provider v-slot="ProviderProps" rules="required">
              <div class="error">{{ ProviderProps.errors[0] }}</div>
              <input type="password" v-model="password" placeholder="パスワード" name="パスワード">
            </validation-provider>
          </div>
        </div>
        <div>
          <button class="login_button" v-on:click="login"
          :disabled="ObserverProps.invalid || !ObserverProps.validated">ログイン</button>
        </div>
      </validation-observer>
      <div>
        <button class="register_button" v-on:click="goRegister">新規登録画面へ</button>
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
  data() {
    return {
      email: null,
      password: null,
      loading: false,
    }
  },
  methods: {
    async login() {
      this.loading = true;
      try {
        await this.$auth.loginWith("laravelJWT", {
          data: {
            email: this.email,
            password: this.password,
          },
        });
        this.loading = false;
        this.$router.push("/");
      } catch {
        this.loading = false;
        alert("メールアドレスまたはパスワードが間違っております");
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
    goRegister() {
      this.$router.push("/register");
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
.login_button {
  margin: 10px;
  background: rgb(124, 165, 255);
}
.guest_button {
  margin-top: 10px;
  background: rgb(255, 167, 167);
}
.register_button {
  background: rgb(216, 255, 193);
}
.error {
  color: red;
}
</style>