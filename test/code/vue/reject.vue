<template>
  <section class="container">
    <div id="" >
      <div>
        <img src="/static/img/fail.png" alt="您的注册申请资料审核不通过">
      </div>
      <h2 class="c-warning">您的注册申请资料审核不通过!</h2>
      <p class="c-grey">拒绝原因：{{ supplierAuditInfo.refuseRemark }} </p>
      <div class="goLogin">
        <router-link :to="{name: 'companyGuide'}" class="cf-button cf-button--primary">编辑后重新提交</router-link>
      </div>
      <p class="mar-t-20 c-grey">如有疑问请联系：<a :href="`mailto:${SERVICE_NUMBER}`">{{ SERVICE_NUMBER }}</a></p>
    </div>
  </section>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { SERVICE_NUMBER } from '@helper/config';
import { LOGOUT } from '@store/types';

export default {
  data() {
    return {
      SERVICE_NUMBER,
    };
  },
  computed: {
    ...mapState({
      supplierAuditInfo: state => state.profile.supplierAuditInfo,
    }),
  },
  methods: {
    ...mapActions({
      LOGOUT,
    }),
    async logout() {
      await this[LOGOUT]();
      this.$router.push({
        name: 'login',
      });
    },
  },
};
</script></script>

<style lang="scss" scoped>
@import '~@/style/helper/vars';

.container {
  min-height: calc(100vh - #{$height4headerandfooter});
  margin-top: 20px;
  margin-bottom: 20px;
  position: relative;
  text-align: center;
  color: $text;

  > div {
    width: 815px;
    padding-top: 100px;
    padding-bottom: 100px;
    margin-left: auto;
    margin-right: auto;
    border: 1px solid $border-gray;
    background-color: #fff;
  }

  h2 {
    height: 28px;
    line-height: 28px;
    font-size: 20px;
    margin-top: 30px;
    margin-bottom: 10px;
    font-weight: 400;
  }

  .goLogin {
    width: 392px;
    margin: 80px auto 14px;
  }
}
</style>
