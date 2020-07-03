<template>
  <cf-panel :title="breadcrumbData">
    <div class="pad-10">
      <div class="" id="J_Invoice_10" >
        <h2  id="J_InvoiceAmount"  style="border:0;" >发票信息</h2>
        <div class="" v-for="(elem, index) in invoices">
          <h5>发票{{index+1}}
            <a href="#" class="delA" @click.prevent="deleteInvoice(index)">
              <b v-show="index!=0">删除</b>
            </a>
          </h5>
          <div class="row" :id="createID('J_invoiceAmount', index)">
            <div class="">发票金额</div>
            <div class="">
              <input type="text" v-decimals class="cf-input cf-input--long" v-model="elem.invoiceAmount" maxlength="50" placeholder="请输入发票金额">
            </div>
            <div class="err"></div>
          </div>
          <div class="row" :id="createID('J_invoiceNo', index)">
            <div class="">发票编号</div>
            <div class="">
              <input type="text" class="cf-input cf-input--long" v-model="elem.invoiceNo" maxlength="50" placeholder="请输入发票编号">
            </div>
            <div class="err"></div>
          </div>
          <div class="row" :id="createID('J_invoiceImage', index)">
            <cf-upload ref="invoices" :id="'invoices_'+index" :acceptType="'image'" :title="'发票照片'" :defaultFileKey="elem.invoiceImageCopy"
              @ossSuccess="(data)=>(elem.invoiceImage = data.key)"></cf-upload>
          </div>
        </div>
        <a class="add-check-btn" style="margin-bottom:10px;" @click.prevent="AddInvoice">
          <span style="font-size:30px;vertical-align:middle;padding-right:6px;">+</span>
          <span style="vertical-align:middle;">添加更多发票信息</span>
        </a>
      </div>
      <div class="" id="J_TradeInfo_11" >
        <h2 id="J_TradeInfo" >贸易合同</h2>
        <div class="" v-for="(elem, index) in tradeInfos">
          <h5>合同{{index+1}}
            <a href="#"  class="delA" @click.prevent="deleteTradeInfo(index)">
              <b v-show="index!=0">删除</b>
            </a>
          </h5>
          <div class="row" :id="createID('J_tradeInfo', index)">
            <div class="star">贸易合同编号</div>
            <div class="">
              <input type="text" class="cf-input cf-input--long" v-model="elem.tradeNo" maxlength="50" placeholder="请输入贸易合同编号">
            </div>
            <div class="err"></div>
          </div>
          <div class="row" :id="createID('J_tradePath', index)">
            <cf-upload ref="tradeInfos" :id="'tradeInfos'+index" :acceptType="'pdf'" :title="'贸易合同'" :defaultFileKey="elem.pathCopy"
              @ossSuccess="(data)=>(elem.path = data.key)"></cf-upload>
              <span class="star star-upload other" ></span>
          </div>
        </div>
        <a class="add-check-btn" style="margin-bottom:10px;" @click.prevent="AddTradeInfo">
          <span style="font-size:30px;vertical-align:middle;padding-right:6px;">+</span>
          <span style="vertical-align:middle;">添加更多贸易合同</span>
        </a>
      </div>
      <div class="" id="J_Receipt_12" >
        <h2  id="J_Receipt"  >验收单据</h2>
        <div class="" v-for="(elem, index) in receipts">
          <h5>单据{{index+1}}
            <a href="#"  class="delA" @click.prevent="deleteReceipt(index)">
              <b v-show="index!=0">删除</b>
            </a>
          </h5>
          <div class="row" :id="createID('J_receipt', index)">
            <cf-upload ref="receipts" :id="'receipts'+index" :acceptType="'image'" :title="'验收单据照片'" :inTitle="'单据'" :defaultFileKey="elem.pathCopy"
              @ossSuccess="(data)=>(elem.path = data.key)"></cf-upload>
              <span class="star star-upload" ></span>
          </div>
        </div>
        <a class="add-check-btn" style="margin-bottom:10px;" @click.prevent="AddReceipt">
          <span style="font-size:30px;vertical-align:middle;padding-right:6px;">+</span>
          <span style="vertical-align:middle;">添加更多验收单据</span>
        </a>
      </div>
      <div class="" style="padding-top:30px;">
        <div style="padding-top:10px;text-align:center;">
          <a class="cf-button cf-button--primary next-btn" @click.prevent="DoSubmit" target="_blank">提交</a>
        </div>
      </div>
    </div>
    <cf-modal :show.sync="pop.ModalVisible" :hideFooter='true' :size="'sm'" :maxLimit="false">
      <div slot="title">{{pop.title}}</div>
      <section class="pad-h-20 pad-t-20 pad-b-50">
        <div class="cf-inline cf-inline--wide" v-html="pop.body"></div>
      </section>
      <div slot="footer"></div>
    </cf-modal>
    <cf-modal
              :show.sync="submitVisible"
              :size="'xs'"
              :canClose="false"
              :hideHeader="true"
              :hideFooter="true">
      <div slot="title">提示</div>
      <section>
        <div class="result-content">
          <div>
            <cf-icon sid="correct"
                     class="result-success-icon"></cf-icon>
          </div>
          <span class="result-success">
            提交成功
          </span>
        </div>
      </section>
    </cf-modal>
  </cf-panel>
</template>
<script>
/* eslint-disable no-empty */
import api from '@api';
import { SET_NOTIFIER_STATUS } from '@store/types';
import { mapState, mapMutations } from 'vuex';

export default {
  name: '',
  components: {},
  async mounted() {
    //do something after mounting vue instance
    this.submitVisible = false;
    this.apId = this.$route.query.apId;
    this.fromId = this.$route.query.id;
    {
      let type = this.$route.query.type;

      let data = (await api.getTapDetails(this.fromId)).content;
      let { attachState } = data;

      attachState.sort((a1, a2) => a1.attachType - a2.attachType);
      this.attachState = attachState;

      attachState.forEach((obj, index) => {
        if (obj.required) {
        } else {
          if (index == 0) {
            document.getElementById('J_Invoice_10').style.display = 'none';
          } else if (index == 1) {
            document.getElementById('J_TradeInfo_11').style.display = 'none';
          } else if (index == 2) {
            document.getElementById('J_Receipt_12').style.display = 'none';
          }
        }
      });

      if (
        document.getElementById('J_Invoice_10').style.display == 'none' &&
        document.getElementById('J_TradeInfo_11').style.display == 'none'
      ) {
        document.getElementById('J_Receipt').style.border = 0;
      } else if (
        document.getElementById('J_Invoice_10').style.display == 'none' &&
        document.getElementById('J_Receipt_12').style.display == 'none'
      ) {
        document.getElementById('J_TradeInfo').style.border = 0;
      } else if (document.getElementById('J_Invoice_10').style.display == 'none') {
        document.getElementById('J_TradeInfo').style.border = 0;
      }

      // 10 发票信息
      // 11 贸易合同
      // 12 验收单据
      document.documentElement.scrollTop = document.body.scrollTop = 0;
    }

    let data = await api.getAttach(this.apId);
    data = data.content || {};
    // 默认值处理
    data.invoices = data.invoices || [];
    data.receipts = data.receipts || [];
    data.tradeInfos = data.tradeInfos || [];

    if (data.invoices.length == 0) {
      this.invoices = [
        {
          invoiceAmount: '',
          invoiceImage: '',
          invoiceNo: '',
        },
      ];
    } else {
      this.invoices = data.invoices;
    }

    if (data.receipts.length == 0) {
      this.receipts = [
        {
          fileName: '',
          path: '',
        },
      ];
    } else {
      this.receipts = data.receipts;
    }

    if (data.tradeInfos.length == 0) {
      this.tradeInfos = [
        {
          tradeNo: '',
          path: '',
        },
      ];
    } else {
      this.tradeInfos = data.tradeInfos;
    }

    // 发票
    for (let idx = 0; idx < this.invoices.length; idx++) {
      this.invoices[idx].invoiceImageCopy = this.invoices[idx].invoiceImage;
    }

    // 贸易合同
    for (let idx = 0; idx < this.tradeInfos.length; idx++) {
      this.tradeInfos[idx].pathCopy = this.tradeInfos[idx].path;
    }

    // 验收单据
    for (let idx = 0; idx < this.receipts.length; idx++) {
      this.receipts[idx].pathCopy = this.receipts[idx].path;
    }
  },
  data: () => ({
    breadcrumbData: [
      {
        link: 'tapHold',
        name: 'TAP管理',
      },
      {
        link: 'tapDetail',
        name: 'TAP详情',
        query: {
          id: window.location.hash.match(/id=(\w+)/)[1],
          from: 'tapToBeConfirmed',
        },
      },
      {
        name: '完善资料',
      },
    ],
    submitVisible: false,
    fromId: 0,
    apId: 0, // 从ap详情页过来的apId值
    errorMsg: '',
    attachState: [],
    pop: {
      ModalVisible: false,
      title: '错误',
      body: '',
    },
    invoices: [
      {
        invoiceAmount: '',
        invoiceImage: '',
        invoiceNo: '',
      },
    ],
    tradeInfos: [
      {
        // "description": "",
        tradeNo: '',
        path: '',
      },
    ],
    receipts: [
      {
        // "description": "",
        fileName: '',
        path: '',
      },
    ],
  }),
  computed: {
    ...mapState({}),
  },
  methods: {
    ...mapMutations({
      SET_NOTIFIER_STATUS,
    }),
    // 添加发票
    AddInvoice() {
      this.invoices.push({
        invoiceAmount: 0,
        invoiceImage: '',
        invoiceNo: '',
      });
    },
    deleteInvoice(idx) {
      this.invoices.splice(idx, 1);
    },
    AddTradeInfo() {
      this.tradeInfos.push({
        // "description": "",
        tradeNo: '',
        path: '',
      });
    },
    deleteTradeInfo(idx) {
      this.tradeInfos.splice(idx, 1);
    },
    AddReceipt() {
      this.receipts.push({
        // "description": "",
        fileName: '',
        path: '',
      });
    },
    deleteReceipt(idx) {
      this.receipts.splice(idx, 1);
    },
    createID(name, idx) {
      return name + '_' + idx;
    },
    scrollIntoView(id) {
      let obj = document.getElementById(id);
      obj.scrollIntoView();
    },

    // 校验
    goErr(id, msg, scroll = true) {
      let obj = document.getElementById(id);
      if (scroll) {
        obj.scrollIntoView();
      }

      obj.classList.add('error');
      obj.querySelector('.err').innerHTML = msg;

      // clearTimeout(goErr['err_'+id]);
      setTimeout(() => {
        obj.classList.remove('error');
        obj.querySelector('.err').innerHTML = '';
      }, 3 * 1000);
    },
    async Check() {
      return new Promise((resolve, reject) => {
        for (let i = 0; i < this.invoices.length; i++) {
          let elem = this.invoices[i];

          // 说明3项都没填写
          if (!elem.invoiceAmount && !elem.invoiceNo && !elem.invoiceImage) {
            continue;
          }

          if (!elem.invoiceAmount) {
            reject('invoiceAmount');
            this.goErr('J_invoiceAmount_' + i, '请填写发票金额');
            return;
          }

          if (!elem.invoiceNo) {
            reject('invoiceNo');
            this.goErr('J_invoiceNo_' + i, '请填写发票编号');
            return;
          }

          // 发票编号10或者12位数字
          if (!/^(\d{10}|\d{12})$/.test(elem.invoiceNo)) {
            reject('invoiceNo');
            this.goErr('J_invoiceNo_' + i, '增值税发票为10位数字，普通发票12位数字');
            return;
          }

          if (!elem.invoiceImage) {
            this.$refs.invoices[i].showErrorMsg('请上传发票');
            this.scrollIntoView('invoices' + i);
            return;
          }
        } // for invoices

        // 贸易合同 tradeInfos
        for (let i = 0; i < this.tradeInfos.length; i++) {
          let elem = this.tradeInfos[i];

          // 说明2项都没填写
          if (!elem.tradeNo && !elem.path) {
            continue;
          }

          if (!elem.tradeNo) {
            reject('tradeinfo');
            this.goErr('J_tradeInfo_' + i, '请填写贸易合同编号');
            return;
          }

          if (!elem.path) {
            this.$refs.tradeInfos[i].showErrorMsg('请上传贸易合同');
            this.scrollIntoView('tradeInfos' + i);
            return;
          }
        } // for tradeInfos

        // 验收单据 receipts
        for (let i = 0; i < this.receipts.length; i++) {
          let elem = this.receipts[i];

          // 说明1项都没填写
          if (!elem.path) {
            continue;
          }

          if (!elem.path) {
            this.$refs.receipts[i].showErrorMsg('请上传单据');
            this.scrollIntoView('receipts' + i);
            return;
          }
        } // for receipts

        // 到这儿就全部校验通过了
        resolve(true);
      });
    },

    // 最终提交
    async DoSubmit() {
      let data = await this.Check(); // 获取前端表单验证结果

      if (data) {
        this.errorMsg = '';

        // 发票，合同， 单据格外处理一下
        let myInvoices = [],
          myTradeInfos = [],
          myRecipts = [];
        {
          myInvoices = this.invoices.filter(elem => {
            if (!elem.invoiceAmount && !elem.invoiceNo && !elem.invoiceImage) {
              return false;
            }
            return true;
          });

          myTradeInfos = this.tradeInfos.filter(elem => {
            if (!elem.tradeNo && !elem.path) {
              return false;
            }
            return true;
          });

          myRecipts = this.receipts.filter(elem => {
            if (!elem.path) {
              return false;
            }
            return true;
          });
        }

        let params = {
          invoices: myInvoices, // this.invoices,
          tradeInfos: myTradeInfos,
          receipts: myRecipts,
        };

        this.attachState.forEach((obj, index) => {
          if (obj.required) {
          } else {
            if (index == 0) {
              delete params.invoices;
            } else if (index == 1) {
              delete params.tradeInfos;
            } else if (index == 2) {
              delete params.receipts;
            }
          }
        });

        // console.log(params);

        try {
          await api.putAttach(this.apId, params);
          this.submitVisible = true;

          setTimeout(() => {
            let id = this.fromId;
            this.$router.push({
              name: 'tapDetail',
              query: {
                id,
                from: 'tapToBeConfirmed',
              },
            });
          }, 3000);
        } catch (e) {
          this.pop.ModalVisible = true;
          this.pop.body = e.errorMsg;
        }
      }
    },
  },
};
</script>
<style lang="scss" scoped>
@import '~@/style/helper/vars';

.delA {
  margin: 10px;
  color: #d0021b;
  font-size: 14px;
}

.result-content {
  text-align: center;
  padding: 15px 0;

  .result-success-icon {
    width: 75px;
    height: 75px;
    margin-bottom: 15px;
  }

  .result-error-icon {
    width: 75px;
    height: 75px;
  }

  .result-success {
    color: rgba(93, 211, 150, 1);
    font-size: 24px;
  }

  .result-error {
    color: $warning;
    font-size: 24px;
  }
}

.row {
  padding-bottom: 20px;
  transition: all 100ms ease;
  > div:first-child {
    padding-bottom: 6px;
  }
  position: relative;
  .label-err {
    position: absolute;
    top: 0;
    right: 0;
    color: #c33;
  }

  .err {
    display: none;
  }
  &.error .err {
    display: block;
  }
}

/* error 错误提示 */

.error {
  input.cf-input,
  select {
    border-color: #c33;
  }
  .err {
    color: #c33;
    position: absolute;
    margin-left: 960px;
    margin-top: 6px;
  }
}

.row .star:after {
  content: '*';
  font-family: SimSun;
  display: none;
  color: #d70c18;
  margin-left: 2px;
  vertical-align: -2px;
  visibility: hidden;
}

.row .star-upload {
  margin-left: -256px;
  vertical-align: -4px;
  &.other {
    margin-left: -282px;
  }
}

h2 {
  padding-bottom: 10px;
  padding-top: 16px;
  border-top: 1px solid #e3e3e3;
}

h5 {
  margin: 0;
  padding: 12px 0;
  padding-top: 0px;
  font-size: 16px;
}

select {
  width: 100%;
}

/* 添加复核人按钮 add-check-btn */

.add-check-btn {
  display: block;
  width: 337px;
  height: 57px;
  line-height: 57px;
  border: 1px solid #4a90e2;
  color: #4a90e2;
  text-align: center;
  cursor: pointer;
}

/* tips */

.tips {
  line-height: 36px;
  font-size: 14px;
  color: #9b9b9b;
  i {
    color: white;
    text-align: center;
    line-height: 18px;
    font-size: 14px;
    font-style: normal;
    display: inline-block;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background-color: #1f8be8;
    margin-right: 6px;
  }
}

.check_label {
  b {
    color: #11bb8a;
  }
}

.error_pop {
  color: $error;
  height: 21px;
}
</style>
