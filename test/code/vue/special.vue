<template>
  <section>
    <cf-poll :callback="init"></cf-poll>
    <cf-panel title="应付账款管理" class="ap-container">
      <div class="ap-operator">
        <!-- <span class="cf-button cf-button--reverse mar-r-10 createAps">
          批量创建AP
          <input type="file" @change="createAps($event)" accept=".csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">
        </span> -->
        <a href="#" class="cf-button cf-button--reverse" @click.prevent="createMultiAP()">批量创建AP</a>
        <a href="#" class="cf-button cf-button--reverse" @click.prevent="createAP()">单笔创建AP</a>
      </div>
      <div>
        <ul class="cf-tab">
          <li>
            <router-link :to="{name: 'apCommitted'}" class="cf-tab-item">已提交</router-link>
          </li>
          <li>
            <router-link :to="{name: 'apPending'}" class="cf-tab-item">待提交({{pendingCount}})</router-link>
          </li>
          <li>
            <router-link :to="{name: 'apDraft'}" class="cf-tab-item">待完善({{draftCount}})</router-link>
          </li>
        </ul>
        <router-view></router-view>
      </div>
    </cf-panel>
  </section>
</template>

<script>
import api from '@api';
import { mapMutations } from 'vuex';
import { SET_NOTIFIER_STATUS } from '@store/types';
import eventbus from '@helper/eventbus';
import { PAGE_SIZE } from '@helper/config';
import CfPoll from '@section/polling';

export default {
  components: {
    CfPoll,
  },
  data() {
    return {
      PAGE_SIZE,
      pendingCount: null,
      draftCount: null,
    };
  },
  methods: {
    ...mapMutations({
      SET_NOTIFIER_STATUS,
    }),
    init() {
      this.getPendingApCount();
      this.getDraftApCount();
    },
    async createAps(e) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('file', file);
      const config = {
        headers: {
          'content-type': 'multipart/form-data',
        },
      };
      await api.createAps(formData, config);
      this[SET_NOTIFIER_STATUS]({
        show: true,
        text: '批量创建AP成功！',
        duration: 1500,
      });
      eventbus.$emit('createAps');
      this.getPendingApCount();
    },
    createAP() {
      this.$router.push({
        name: 'apDraftCreate',
      });
    },
    createMultiAP() {
      this.$router.push({
        name: 'apCreateMulti',
      });
    },
    async getPendingApCount() {
      const { content } = await api.getApList({
        apStatus: '1',
      });
      this.pendingCount = content.totalCount;
    },

    // 获取待完善 AP 列表 和 计算待完善 AP 的数量
    async getDraftApCount() {
      const { content } = await api.getDraftApList({
        page: 1,
        pageSize: PAGE_SIZE,
      });
      this.draftCount = content.totalCount;
    },

    // 批量上传 Ap 一旦完成，两个需要列出统计数字的表格都要重新获取统计数字一次
    pendingAndDraftCountboth() {
      this.getPendingApCount();
      this.getDraftApCount();
    },
  },

  created() {
    eventbus.$on('ap:delete', this.getPendingApCount);
    eventbus.$on('multiAgreement:done', this.getPendingApCount);
    eventbus.$on('draftAp:delete', this.getDraftApCount);
    eventbus.$on('createMulti:complete', this.pendingAndDraftCountboth);
    this.init();
  },
};
</script>

<style lang="scss" scoped>
@import '~@/style/helper/vars';

.create-multi-ap-notice {
  background-color: #fff7e5;
  font-size: 14px;
  color: #ecb246;
  padding: 10px 15px;
  line-height: 1.2;
  border-radius: 3px;
  border: 1px solid rgb(248, 226, 211);
  position: relative;
  margin-bottom: 10px;

  .create-multi-ap-notice-close {
    position: absolute;
    right: 15px;
    top: 10px;
    cursor: pointer;
    opacity: 0.5;

    &:hover {
      opacity: 0.8;
    }
  }
}

.ap-container {
  position: relative;
}

.ap-operator {
  position: absolute;
  right: 30px;
  top: 15px;
}

.createAps {
  position: relative;
  input {
    position: absolute;
    overflow: hidden;
    left: 0;
    top: 0;
    width: 136px;
    height: 36px;
    opacity: 0;
    cursor: pointer;
  }
}
</style>
