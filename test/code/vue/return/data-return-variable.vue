<template>
  <!-- 
    this 是 Comment注释
    应该忽略
  -->
  <section class="guide-wrap-section">
    <p>相同内容<br/>建议提前准备如下资料，以便快速完成填写<span>相同内容</span></p>
  </section>
</template>

<script>
const VueData = {};
export default {
  async mounted() {},
  data(){
    return VueData
  },
  methods: {
    goToSupplierEnter() {
      this.$router.push({
        name: 'companyEnter'
      });
    }
  }
};
</script>
