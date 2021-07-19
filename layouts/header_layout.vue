<template>
  <div class="default_container">
    <Header />
    <Nuxt />
    <Footer />
  </div>
</template>

<script>
import Header from "../components/header.vue";
import Footer from "../components/footer.vue";
export default {
  components: {
    Header,
    Footer
  }
};
</script>

<style src="~/assets/css/reset.css">
</style>

<style>
  html,body,#__nuxt,#__layout {
    height: 100%;
  }
.default_container {
  min-height: 100%;
  background: rgb(255, 239, 227);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
a {
  text-decoration: none;
  color: rgb(0, 0, 0);
  cursor: pointer;
}
</style>