<template>
  <section class="guide-wrap-section">
    <p>建议提前准备如下资料，以便快速完成填写</p>
  </section>
</template>

<script>
export default {
  async mounted() {},
  data() {
    console.log();
    return {
      aaa: '100',
      bbb: '300',
    };
  },
  methods: {
    goToSupplierEnter() {
      this.$router.push({
        name: 'companyEnter',
      });
    },
  },
};
</script>
