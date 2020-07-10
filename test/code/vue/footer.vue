<template>
  <footer class="cf-footer" v-show="show">
    <p>借贷有风险，投资需谨慎</p>
    <p>
      ©2018 环宇信链 辽ICP备<span class="splitter">|</span>8003078号-1<span class="splitter">|</span
      >{{ Labels.aMajorCityInLiaoningCorporationDalianPrivate }}
    </p>
  </footer>
</template>

<script>
import { formatMessage } from '~/locale-tools';

export default {
  name: 'CfFooter',

  props: {
    show: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      Labels: {
        aMajorCityInLiaoningCorporationDalianPrivate: formatMessage({
          id: 'a-major-city-in-liaoning-corporation-dalian-private',
        }),
      },
    };
  },
};
</script>

<style lang="scss" scoped>
.cf-footer {
  font-size: 14px;
  text-align: center;
  height: 112px;
  padding-top: 25px;
  background-color: #e4e4e4;
  color: #999;

  > p {
    margin: 0;
    margin-bottom: 10px;
    line-height: 20px;

    &:first-child {
      color: #bbb;
    }

    .splitter {
      margin-left: 10px;
      margin-right: 10px;
      vertical-align: 1px;
    }
  }
}
</style>
