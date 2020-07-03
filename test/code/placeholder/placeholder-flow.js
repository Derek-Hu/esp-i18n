import menuLoanApplyImage from './images/menu-loanApply.png';
import menuWithdrawImage from './images/menu-withdraw.png';
import menuRepaymentImage from './images/menu-repayment.png';
import menuOtherImage from './images/menu-other.png';

type Props = {};
type State = {
  hotList: Object[],
  menu: Object[]
};

export default class FaqIndex extends React.Component<Props, State> {
  state = {
    hotList: [],
    menu: [
      {
        group: 2,
        title: '额度申请',
        ico: menuLoanApplyImage
      },
      {
        group: 3,
        title: '借款',
        ico: menuWithdrawImage
      },
      {
        group: 4,
        title: '还款',
        ico: menuRepaymentImage
      },
      {
        group: 1,
        title: '其它',
        ico: menuOtherImage
      }
    ]
  };

  componentWillMount() {
    this.createHotList();
  }

  createHotList() {
    const { questions } = productConfigAll.eloan;
    const hotList = questions.filter(
      (item: Object): boolean => {
        const { isHot, platform } = item;
        return isHot && (!platform || platform === 'app');
      }
    );

    this.setState({
      hotList
    });
  }

  render(): React$Node {
    const { menu, hotList } = this.state;
    return (
      <div className="containerMobile">
        <div className="mainContentMobile">
          <section styleName="menu">
            <ul>
              {menu.map(
                (item: Object): React$Node => (
                  <li key={item.group}>
                    <Link to={`/mobile/eloan/faq/list/${item.group}`}>
                      <span styleName="icon">
                        <img alt={item.title} src={item.ico} />
                      </span>
                      <span styleName="text">{item.title}</span>
                    </Link>
                  </li>
                )
              )}
            </ul>
          </section>
          <section styleName="hotList">
            <p styleName="title">热门问题</p>
            <ul>
              {hotList.map(
                (item: Object): React$Node => (
                  <li key={item.id}>
                    <Link to={`/mobile/eloan/faq/detail/${item.id}`}>
                      {item.question}
                      <i styleName="arrow" />
                    </Link>
                  </li>
                )
              )}
            </ul>
          </section>
        </div>
      </div>
    );
  }
}