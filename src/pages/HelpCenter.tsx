import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  HelpCircle,
  ChevronDown,
  X,
  Calendar,
  CreditCard,
  User,
  Palette,
  Shield,
  MessageCircle,
} from 'lucide-react';
import { Navbar } from '../components/Navbar';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface FAQCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  items: FAQItem[];
}

const faqData: FAQCategory[] = [
  {
    id: 'booking',
    name: '预约流程',
    icon: <Calendar className="w-5 h-5" />,
    items: [
      {
        id: 'b1',
        question: '如何预约纹身服务？',
        answer: '您可以通过浏览作品墙，找到心仪的纹身师，进入其个人主页后点击「立即预约」按钮，填写预约信息（包括纹身风格、尺寸、预算、联系方式、期望日期和时间段），提交后纹身师会在24小时内确认或联系您沟通细节。',
      },
      {
        id: 'b2',
        question: '预约后多久能得到确认？',
        answer: '纹身师通常会在24小时内处理您的预约请求。您可以在「我的预约」页面查看预约状态。如果超过48小时仍未得到确认，建议您联系纹身师或通过客服咨询。',
      },
      {
        id: 'b3',
        question: '可以修改预约信息吗？',
        answer: '在纹身师确认预约前，您可以联系纹身师协商修改预约细节。预约确认后如需修改，请提前24小时与纹身师沟通，双方确认后可调整。',
      },
      {
        id: 'b4',
        question: '如何取消预约？',
        answer: '您可以在「我的预约」中找到对应订单，点击「取消预约」，选择取消原因并提交。根据取消时间的不同，可能会产生一定违约金：预约前24小时以上免费取消，6-24小时收取30%违约金，6小时内收取50%违约金。',
      },
    ],
  },
  {
    id: 'payment',
    name: '费用支付',
    icon: <CreditCard className="w-5 h-5" />,
    items: [
      {
        id: 'p1',
        question: '纹身费用如何计算？',
        answer: '纹身费用根据图案尺寸、复杂度、纹身师资历以及所在地区等因素综合计算。每位纹身师的个人主页上会显示其价格区间。最终价格请在预约前与纹身师沟通确认。',
      },
      {
        id: 'p2',
        question: '支持哪些支付方式？',
        answer: '目前平台支持微信支付、支付宝和银行转账三种支付方式。您可以在支付环节选择最方便的方式进行付款。支付成功后会收到电子凭证。',
      },
      {
        id: 'p3',
        question: '需要支付定金吗？',
        answer: '部分纹身师可能会要求支付定金以锁定预约时间，定金金额通常为总费用的20%-30%。定金会在最终结算时抵扣。如因您个人原因取消预约，定金可能不予退还。',
      },
      {
        id: 'p4',
        question: '退款政策是怎样的？',
        answer: '如需退款，请根据取消预约政策执行。符合免费取消条件的订单，款项会在3-5个工作日内原路退回。产生违约金的订单，扣除违约金后的剩余金额将退回至您的支付账户。',
      },
    ],
  },
  {
    id: 'user',
    name: '用户账号',
    icon: <User className="w-5 h-5" />,
    items: [
      {
        id: 'u1',
        question: '如何注册账号？',
        answer: '首次使用时，在预约或收藏操作中输入您的联系方式即可自动创建账号。您也可以在「个人中心」完善个人资料，包括昵称、头像、手机号等信息。',
      },
      {
        id: 'u2',
        question: '如何修改个人信息？',
        answer: '进入「个人中心」页面，您可以修改昵称、头像、手机号等个人信息。修改手机号需要验证新号码，确保账号安全。',
      },
      {
        id: 'u3',
        question: '忘记联系方式怎么办？',
        answer: '如果您忘记了预约时使用的联系方式，可以通过客服热线或在线客服进行找回，需要提供预约时的相关信息进行身份验证。',
      },
    ],
  },
  {
    id: 'artist',
    name: '纹身师入驻',
    icon: <Palette className="w-5 h-5" />,
    items: [
      {
        id: 'a1',
        question: '如何成为平台纹身师？',
        answer: '有意入驻的纹身师可以在「艺术家后台」提交入驻申请，需要提供个人身份证明、从业资质证明、作品集等资料。平台审核通过后即可开通纹身师账号，开始接单。',
      },
      {
        id: 'a2',
        question: '纹身师如何管理作品？',
        answer: '登录「艺术家后台」后，您可以上传、编辑和删除作品，设置作品的风格标签。优质的作品展示有助于获得更多客户关注和预约。',
      },
      {
        id: 'a3',
        question: '如何设置价格和营业时间？',
        answer: '在艺术家后台的「设置」页面，您可以设置价格区间、服务项目、可预约时间段等信息。建议根据市场行情和自身资历合理定价。',
      },
    ],
  },
  {
    id: 'safety',
    name: '安全保障',
    icon: <Shield className="w-5 h-5" />,
    items: [
      {
        id: 's1',
        question: '平台如何保障纹身卫生安全？',
        answer: '平台所有入驻纹身师均需通过资质审核，承诺使用一次性消毒针头、正规品牌色料，严格遵循卫生操作规范。如您在服务过程中发现任何卫生问题，可向平台投诉。',
      },
      {
        id: 's2',
        question: '我的个人信息安全吗？',
        answer: '我们非常重视用户隐私保护。所有个人信息均采用加密存储，仅用于预约沟通和服务提供，不会泄露给任何第三方。您可以在个人中心查看和管理您的数据。',
      },
      {
        id: 's3',
        question: '对服务不满意怎么办？',
        answer: '如对纹身师服务不满意，您可在订单完成后7天内提交评价或投诉。平台会介入调查，根据实际情况协助您与纹身师协商解决方案，包括补色、修正或部分退款等。',
      },
    ],
  },
  {
    id: 'contact',
    name: '联系我们',
    icon: <MessageCircle className="w-5 h-5" />,
    items: [
      {
        id: 'c1',
        question: '如何联系客服？',
        answer: '您可以通过以下方式联系我们的客服团队：\n\n• 客服热线：400-888-8888（工作时间 10:00-22:00）\n• 在线客服：点击页面右下角的客服图标\n• 邮箱：support@inkmatch.com\n• 微信公众号：INKMATCH 官方',
      },
      {
        id: 'c2',
        question: '投诉与建议渠道',
        answer: '我们非常重视您的反馈。您可以通过客服热线、在线客服或邮箱提交投诉或建议。对于投诉，我们会在24小时内响应，3个工作日内给出处理结果。',
      },
      {
        id: 'c3',
        question: '商务合作如何联系？',
        answer: '如有商务合作意向（如纹身店入驻、品牌合作、活动赞助等），请发送邮件至 business@inkmatch.com，我们会有专人与您对接。',
      },
    ],
  },
];

export function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const filteredData = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query && !activeCategory) {
      return faqData;
    }

    return faqData
      .filter((cat) => !activeCategory || cat.id === activeCategory)
      .map((cat) => ({
        ...cat,
        items: query
          ? cat.items.filter(
              (item) =>
                item.question.toLowerCase().includes(query) ||
                item.answer.toLowerCase().includes(query)
            )
          : cat.items,
      }))
      .filter((cat) => cat.items.length > 0);
  }, [searchQuery, activeCategory]);

  const totalResults = filteredData.reduce((sum, cat) => sum + cat.items.length, 0);

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="container py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          返回首页
        </Link>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-full bg-blood/20 flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-8 h-8 text-blood" />
            </div>
            <h1 className="font-display text-3xl text-white mb-2">帮助中心</h1>
            <p className="text-gray-400">
              在这里您可以找到常见问题的解答，如有其他问题请联系客服
            </p>
          </div>

          <div className="mb-8 space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索关键词，例如：预约、退款、价格..."
                className="w-full pl-12 pr-12 py-4 bg-graphite border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blood/50 transition-colors text-base"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveCategory(null)}
                className={`tag-chip ${activeCategory === null ? 'tag-chip-active' : ''}`}
              >
                全部
              </button>
              {faqData.map((category) => (
                <button
                  key={category.id}
                  onClick={() =>
                    setActiveCategory((prev) => (prev === category.id ? null : category.id))
                  }
                  className={`tag-chip flex items-center gap-1.5 ${
                    activeCategory === category.id ? 'tag-chip-active' : ''
                  }`}
                >
                  {category.icon}
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {(searchQuery || activeCategory) && (
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-400 text-sm">
                共找到 <span className="text-blood font-medium">{totalResults}</span> 个相关问题
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory(null);
                }}
                className="text-sm text-gray-400 hover:text-blood transition-colors"
              >
                清除筛选
              </button>
            </div>
          )}

          {totalResults === 0 ? (
            <div className="text-center py-16 bg-graphite border border-white/5">
              <HelpCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">未找到相关问题</p>
              <p className="text-gray-500 text-sm">
                请尝试其他关键词，或联系在线客服获取帮助
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {filteredData.map((category) => (
                <div key={category.id}>
                  <h2 className="flex items-center gap-2 text-lg font-medium text-white mb-4 pb-3 border-b border-white/10">
                    <span className="text-blood">{category.icon}</span>
                    {category.name}
                    <span className="text-gray-500 text-sm font-normal">
                      ({category.items.length})
                    </span>
                  </h2>
                  <div className="space-y-3">
                    {category.items.map((item) => (
                      <div
                        key={item.id}
                        className="bg-graphite border border-white/5 overflow-hidden"
                      >
                        <button
                          onClick={() => toggleExpand(item.id)}
                          className="w-full flex items-start justify-between gap-4 p-5 text-left hover:bg-white/[0.02] transition-colors"
                        >
                          <span className="text-white font-medium flex-1">
                            {item.question}
                          </span>
                          <ChevronDown
                            className={`w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5 transition-transform duration-300 ${
                              expandedItems.has(item.id) ? 'rotate-180 text-blood' : ''
                            }`}
                          />
                        </button>
                        <div
                          className={`overflow-hidden transition-all duration-300 ${
                            expandedItems.has(item.id)
                              ? 'max-h-[500px] opacity-100'
                              : 'max-h-0 opacity-0'
                          }`}
                        >
                          <div className="px-5 pb-5 pt-0">
                            <div className="pt-0 border-t border-white/5" />
                            <p className="text-gray-400 leading-relaxed whitespace-pre-line pt-4">
                              {item.answer}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-16 p-8 bg-gradient-to-br from-blood/10 to-transparent border border-blood/20 text-center">
            <h3 className="text-white font-medium text-lg mb-2">没有找到您需要的答案？</h3>
            <p className="text-gray-400 mb-6 text-sm">
              我们的客服团队随时为您提供帮助
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="btn-primary flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                在线客服
              </button>
              <button className="btn-outline flex items-center gap-2">
                <HelpCircle className="w-5 h-5" />
                提交反馈
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
