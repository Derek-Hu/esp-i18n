<template>
  <div v-show="show" @keyup.esc="show && hide()" tabindex="-1">
    <transition name="modal-fade">
      <div class="cf-modal" v-show="show" :class="modalSize">
        <div class="cf-modal-dialog">
          <div class="cf-modal-content">
            <div class="cf-modal-header" v-if="!hideHeader">
              <slot name="header">
                <span class="cf-close" @click="hide()" title="关闭" v-show="canClose">
                  <cf-icon sid="close"></cf-icon>
                </span>
                <h4 class="cf-modal-title text-center">
                  <slot name="title">{{title}}</slot>
                </h4>
              </slot>
            </div>
            <div class="cf-modal-body"  :class="{'cf-modal-body--maxLimit': maxLimit}">
              <slot></slot>
            </div>
            <div class="cf-modal-footer" v-if="!hideFooter">
              <slot name="footer">
                <button type="button" class="cf-button cf-button--default cf-button--sm mar-r-5" @click="cancel()">{{cancelText}}</button>
                <button type="button" class="cf-button cf-button--primary cf-button--sm" @click="ok()">{{okText}}</button>
              </slot>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <div class="cf-modal-backdrop"></div>
  </div>
</template>

<script>
import { mapMutations } from 'vuex';
import { SET_WARNING_STATUS } from '@store/types';

export default {
  name: 'CfModal',

  props: {
    show: {
      type: Boolean,
      required: false,
    },
    title: {
      type: String,
      default: '',
    },
    size: {
      type: String,
      default: 'md',
    },
    okText: {
      type: String,
      default: '确认',
    },
    cancelText: {
      type: String,
      default: '取消',
    },
    hideHeader: {
      type: Boolean,
      default: false,
    },
    hideFooter: {
      type: Boolean,
      default: false,
    },
    isWarning: {
      type: Boolean,
      default: false,
    },
    maxLimit: {
      type: Boolean,
      default: true,
    },
    canClose: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {};
  },
  computed: {
    modalSize() {
      return `cf-modal--${this.size}`;
    },
  },
  methods: {
    ...mapMutations({
      SET_WARNING_STATUS,
    }),
    ok() {
      this.hide();
      this.$emit('ok');
    },
    cancel() {
      this.hide();
      this.$emit('cancel');
    },
    hide() {
      if (!this.canClose) {
        return;
      }
      if (this.isWarning) {
        this[SET_WARNING_STATUS]({
          show: false,
          header: '',
          body: '',
        });
      } else {
        this.$emit('update:show', false);
      }
    },
  },
  watch: {
    show(show) {
      let y = window.pageYOffset;

      show &&
        this.$nextTick(() => {
          this.$el.focus();
          window.scrollTo(0, y);
        });
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@/style/helper/vars';
@import '~@/style/helper/fn';

.cf-modal {
  $size: (
    'xs': 360px,
    'sm': 480px,
    'md': 600px,
    'lg': 800px,
    'xl': 980px,
  );
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  background-color: #fff;
  border: $border-gray;
  border-radius: $border-radius;
  z-index: z('modal');
  width: map-get($size, 'md');
  &--xs {
    width: map-get($size, 'xs');
  }
  &--sm {
    width: map-get($size, 'sm');
  }
  &--lg {
    width: map-get($size, 'lg');
  }
  &--xl {
    width: map-get($size, 'xl');
  }
}

.cf-modal-backdrop {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: z('backdrop');
  background-color: $background-backdrop;
}

.cf-modal-header {
  padding: 15px;
  border-bottom: 1px solid $border-gray;
  position: relative;
  h4 {
    font-size: 18px;
    font-weight: 400;
  }
}

.cf-modal-footer {
  padding: 15px;
  text-align: right;
  border-top: 1px solid $border-gray;
}

.cf-modal-body {
  position: relative;
  padding: 15px;
}

.cf-modal-body--maxLimit {
  max-height: calc(100vh - 180px);
  overflow-y: auto;
}

.cf-close {
  $size: 28px;
  position: absolute;
  top: 50%;
  right: $size / 2;
  float: right;
  font-size: 21px;
  color: $gray;
  opacity: 0.6;
  // margin-top: -2px;
  margin-top: -$size/2;
  padding: 0;
  cursor: pointer;
  background: none;
  border: 0;
  -webkit-appearance: none;
  font-weight: 700;
  border-radius: 50%;
  outline: 0;
  width: $size;
  height: $size;
  line-height: 30px;
  text-align: center;
  &:hover {
    background: $brand-1;
    opacity: 1;
    > .cf-icon {
      fill: #fff;
    }
  }
  &--sm {
    width: $size / 1.4;
    line-height: $size / 1.4;
    font-size: 12px;
  }
}

.modal-fade-enter-active {
  transition: all 0.3s ease-out;
}

.modal-fade-enter {
  top: 0;
  opacity: 0;
}
</style>
