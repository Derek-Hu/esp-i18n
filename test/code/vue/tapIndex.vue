<template>
  <cf-panel title="TAP管理" class="ap-container">
    <div>
      <ul class="cf-tab">
        <li>
          <router-link :to="{name: 'tapHold'}" class="cf-tab-item">持有中({{ holdCount }})</router-link>
        </li>
        <li>
          <router-link :to="{name: 'tapToBeConfirmed'}" class="cf-tab-item" v-if="isL1">待确认({{ toBeConfirmedCount }})</router-link>
        </li>
        <li>
          <router-link :to="{name: 'tapToBeReceived'}" class="cf-tab-item" v-if="!isL1">待接收({{ toBeReceivedCount }})</router-link>
        </li>
      </ul>
      <router-view></router-view>
    </div>
  </cf-panel>
</template>

<script>
import api from '@api';
import { mapState } from 'vuex';
import eventbus from '@helper/eventbus';

import { TAP_TYPE_CONFIRMED, TAP_TYPE_APPEND, TAP_TYPE_TAPPEND } from '@helper/const';

export default {
  data() {
    return {
      holdCount: null,
      toBeConfirmedCount: null,
      toBeReceivedCount: null,
    };
  },
  computed: mapState({
    isL1: state => state.profile.isL1,
  }),
  methods: {
    async getTapTotalAuantitys() {
      const { content } = await api.getTapTotalAuantitys();

      this.holdCount = content[TAP_TYPE_CONFIRMED];
      this.toBeConfirmedCount = content[TAP_TYPE_APPEND];
      this.toBeReceivedCount = content[TAP_TYPE_TAPPEND];
    },
  },
  created() {
    eventbus.$on('tapSearch', this.getTapTotalAuantitys);
    this.getTapTotalAuantitys();
  },
};
</script>
