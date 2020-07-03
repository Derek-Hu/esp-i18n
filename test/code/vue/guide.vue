<template>
  <section class="guide-wrap-section" >
    <div class="guide-wrap">
      <div class="guide-top">
        <p class="fz24">即将开始完善企业资料</p>
        <p>建议提前准备如下资料，以便快速完成填写</p>
      </div>
      <div class="guide-box">
        <dl class="">
          <dt class="fz19" >企业资料</dt>
          <dd>1.营业执照扫描件</dd>
          <dd>2.企业征信报告</dd>
          <dd>3.企业征信查询授权书</dd>
          <dd><a href="/api/company/template?template=CREDIT_AUTHORIZATION" class="down-tml" >下载模版</a></dd>
        </dl>
        <dl class="">
          <dt class="fz19" >法定代表人资料</dt>
          <dd>1.身份证正面扫描件+反面扫描件(仅支持jpg/bmp/png,2M以内)</dd>
          <dd>2.个人征信报告</dd>
        </dl>
        <dl class="">
          <dt class="fz19" >经办人资料</dt>
          <dd>1.身份证正面扫描件+反面扫描件(仅支持jpg/bmp/png,2M以内)</dd>
          <dd>2.委托授权书</dd>
          <dd><a href="/api/company/template?template=OPERATOR_AUTHORIZATION" class="down-tml" >下载模版</a></dd>
        </dl>
      </div>
      <div class="guide-footer">
        <p>注：以上资料须为彩色原件扫描件或数码照片，支持jpg,bmp,png,pdf格式(特殊说明除外)，5M以下<br>
      流程最后需法定代表人及经办人进行人脸识别，建议提前通知相关人员</p>
        <div class="" style="text-align:center;" >
          <button type="button" class="cf-button cf-button--primary" name="button" @click.prevent="goToSupplierEnter" >开始完善资料</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  async mounted() {},
  data() {
    return {};
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

<style lang="scss" scoped>
@import '~@/style/helper/vars';
p {
  color: #4a4a4a;
  font-size: 16px;
}
.fz24 {
  font-size: 24px;
}
.fz19 {
  font-size: 19px;
}
.guide-wrap-section {
  &:after {
    content: '';
    display: block;
    height: 40px;
  }
}

.guide-wrap {
  padding-top: 70px;
  min-width: 820px;
  margin: auto;
  border: 1px solid #e1e1e1;
}

.guide-top {
  padding-bottom: 60px;
  text-align: center;
  padding-top: 74px;
  background: url(/static/img/notepad.png) center top no-repeat;
  background-size: 57px;
  > p:last-child {
    color: #969696;
    padding-top: 6px;
  }
}

.guide-box {
  width: 544px;
  margin: auto;
  dl {
    dt {
      color: #969696;
      line-height: 42px;
      border-bottom: 1px solid #e6e6e6;
      margin-bottom: 7px;
    }

    dd {
      line-height: 30px;
    }

    padding-bottom: 35px;
    &:last-child {
      padding-bottom: 0px;
    }
  }
}

.guide-footer {
  padding-top: 45px;
  width: 544px;
  margin: auto;
  padding-left: 30px;
  p {
    color: #9b9b9b;
    padding-bottom: 44px;
    font-weight: normal;
    width: 600px;
    font-size: 14px;
    text-indent: -2em;
  }
  padding-bottom: 36px;
}

.down-tml {
  color: #4a90e2;
  position: absolute;
  margin-left: 470px;
  margin-top: -22px;
  white-space: nowrap;
}
</style>
