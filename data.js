/* ============================================================
   Phoenix 原型 · 预置数据与剧本回复
   ============================================================ */

const STORAGE_KEY = 'phoenix.proto.v1';
const SESSION_KEY = 'phoenix.proto.session';
const THEME_KEY = 'phoenix.proto.theme';

/* ---------- 工具池（平铺展示，不做风险分级，见 PRD 3.7-6） ---------- */
const TOOL_DEFS = [
  { name: 'query_knowledge', desc: '检索企业知识库', disabled: true, disabledReason: '需先创建知识库' },
  { name: 'run_script',      desc: '运行白名单内预置取数脚本', disabled: false },
  { name: 'web_fetch',       desc: '联网抓取网页内容', disabled: false },
  /* ↓ 以下为演示数据：用于评审「工具过多」时选择器的承载形态（滚动/搜索/仅看已选），正式联调前按 PRD 实际工具清单裁剪 ↓ */
  { name: 'query_station_data', desc: '查询储能场站实时数据', disabled: false },
  { name: 'query_alarm',        desc: '查询场站告警记录', disabled: false },
  { name: 'create_ticket',      desc: '创建运维工单', disabled: false },
  { name: 'send_email',         desc: '发送邮件通知', disabled: false },
  { name: 'send_im_message',    desc: '发送企业微信/钉钉消息', disabled: false },
  { name: 'export_report',      desc: '导出报表为 Excel/PDF', disabled: false },
  { name: 'query_weather',      desc: '查询场站天气与辐照数据', disabled: false },
  { name: 'calc_revenue',       desc: '测算电站收益', disabled: false },
  { name: 'query_device',       desc: '查询设备台账与状态', disabled: false },
  { name: 'control_dispatch',   desc: '下发调度指令', disabled: false },
  { name: 'query_grid_price',   desc: '查询电网电价曲线', disabled: false },
  { name: 'ocr_document',       desc: '识别票据/合同图片内容', disabled: false },
  { name: 'translate_text',     desc: '多语言互译', disabled: false },
  { name: 'summarize_doc',      desc: '长文档摘要', disabled: false },
  { name: 'read_file',          desc: '读取本地文件内容', disabled: false },
  { name: 'write_file',         desc: '写入/生成文件', disabled: false },
  { name: 'db_query',           desc: '查询业务数据库', disabled: false },
  { name: 'api_request',        desc: '调用自定义 HTTP 接口', disabled: false },
  { name: 'calendar_query',     desc: '查询日程安排', disabled: false },
  { name: 'calendar_create',    desc: '创建日程/会议', disabled: false },
  { name: 'todo_manage',        desc: '待办事项增删改查', disabled: false },
  { name: 'data_visualize',     desc: '生成数据图表', disabled: false },
  { name: 'image_generate',     desc: '文生图', disabled: false },
  { name: 'speech_to_text',     desc: '语音转文字', disabled: false },
  { name: 'code_interpreter',   desc: '运行 Python 分析代码', disabled: false },
  { name: 'knowledge_write',    desc: '写入企业知识库', disabled: false },
  { name: 'ssh_exec',           desc: 'SSH 执行远程命令', disabled: false },
];

/* ---------- 初始数据（一键重置恢复到此状态） ---------- */
function buildSeed() {
  return {
    users: [
      { username: 'admin',      name: '钱多多', password: '123456', role: 'admin',  status: 'active',   builtin: true },
      { username: 'lishichuan', name: '李四川', password: '123456', role: 'member', status: 'active',   builtin: false },
      { username: 'zhangsan',   name: '张三',   password: '123456', role: 'admin',  status: 'disabled', builtin: false },
      { username: 'hejun',      name: '何俊',   password: '123456', role: 'admin',  status: 'active',   builtin: false },
      { username: 'liwei',      name: '李薇',   password: '123456', role: 'member', status: 'active',   builtin: false },
      { username: 'wangfang',   name: '王芳',   password: '123456', role: 'member', status: 'active',   builtin: false },
      { username: 'zhaolei',    name: '赵磊',   password: '123456', role: 'member', status: 'disabled', builtin: false },
      { username: 'chenjing',   name: '陈静',   password: '123456', role: 'member', status: 'active',   builtin: false },
      { username: 'liuyang',    name: '刘洋',   password: '123456', role: 'member', status: 'active',   builtin: false },
      { username: 'sunqian',    name: '孙倩',   password: '123456', role: 'member', status: 'active',   builtin: false },
      { username: 'zhoujie',    name: '周杰',   password: '123456', role: 'member', status: 'active',   builtin: false },
      { username: 'wumin',      name: '吴敏',   password: '123456', role: 'member', status: 'active',   builtin: false },
      { username: 'zhengbo',    name: '郑博',   password: '123456', role: 'member', status: 'active',   builtin: false },
      { username: 'fenghao',    name: '冯浩',   password: '123456', role: 'member', status: 'disabled', builtin: false },
      { username: 'xuli',       name: '徐丽',   password: '123456', role: 'member', status: 'active',   builtin: false },
      { username: 'gaofei',     name: '高飞',   password: '123456', role: 'member', status: 'active',   builtin: false },
      { username: 'linna',      name: '林娜',   password: '123456', role: 'member', status: 'active',   builtin: false },
      { username: 'guoyan',     name: '郭岩',   password: '123456', role: 'member', status: 'active',   builtin: false },
    ],
    agents: [
      {
        id: 'ag-general', name: '通用助手', level: 'system',
        persona: '你是通用助手，负责回答各类问题、协助完成日常工作，不绑定特定业务分身。回答要求结构清晰、结论先行。',
        model: 'deepseek-v4-pro', approval: 'auto', rounds: null, context: 200,
        tools: ['web_fetch'], created: '2026-09-01 09:00', deleted: false,
      },
      {
        id: 'ag-ops', name: '运营巡检官', level: 'user',
        persona: '你是运营巡检官，负责储能场站的日常巡检、数据核对与异常归因，输出结构化巡检结论与处置建议。',
        model: 'deepseek-v4-pro', approval: 'auto', rounds: null, context: 200,
        tools: ['run_script', 'web_fetch'], created: '2026-09-01 09:00', deleted: false,
      },
      {
        id: 'ag-report', name: '报表助手', level: 'user',
        persona: '你是报表助手，负责生成各类运营报表与数据解读，输出结论先行、图表配套的周报与月报内容。',
        model: 'glm-5.3-flash', approval: 'ask', rounds: 20, context: 200,
        tools: [], created: '2026-09-20 14:32', deleted: false,
      },
      {
        id: 'ag-qc', name: '客服质检员', level: 'user',
        persona: '你是客服质检员，负责抽检客服会话记录，按服务规范打分并输出改进建议。',
        model: 'glm-5.3-flash', approval: 'auto', rounds: null, context: 200,
        tools: ['db_query', 'export_report'], created: '2026-09-03 10:12', deleted: false,
      },
      {
        id: 'ag-contract', name: '合同审阅官', level: 'user',
        persona: '你是合同审阅官，负责审阅商务合同条款，识别风险点并给出修订建议。',
        model: 'deepseek-v4-pro', approval: 'ask', rounds: 30, context: 500,
        tools: ['ocr_document', 'summarize_doc'], created: '2026-09-05 16:40', deleted: false,
      },
      {
        id: 'ag-label', name: '数据标注员', level: 'user',
        persona: '你是数据标注员，负责按标注规范对文本样本进行分类与打标，保证口径一致。',
        model: 'doubao-seed-1.6', approval: 'auto', rounds: null, context: 100,
        tools: ['run_script'], created: '2026-09-08 09:25', deleted: false,
      },
      {
        id: 'ag-sentiment', name: '舆情监测员', level: 'user',
        persona: '你是舆情监测员，负责监测公开渠道的品牌舆情，按等级汇总预警。',
        model: 'kimi-k2-0905', approval: 'auto', rounds: null, context: 200,
        tools: ['web_fetch', 'send_im_message'], created: '2026-09-10 14:05', deleted: false,
      },
      {
        id: 'ag-hr', name: '简历筛选助手', level: 'user',
        persona: '你是简历筛选助手，负责按岗位要求初筛简历，输出匹配度分析与面试建议。',
        model: 'glm-5.3-flash', approval: 'ask', rounds: 10, context: 200,
        tools: ['read_file'], created: '2026-09-12 11:48', deleted: false,
      },
      {
        id: 'ag-weekly', name: '周报汇总员', level: 'user',
        persona: '你是周报汇总员，负责汇总团队成员周报，提炼进展、风险与下周计划。',
        model: 'deepseek-v4-flash', approval: 'auto', rounds: null, context: 200,
        tools: ['read_file', 'send_email'], created: '2026-09-15 17:30', deleted: false,
      },
      {
        id: 'ag-cr', name: '代码评审员', level: 'user',
        persona: '你是代码评审员，负责评审提交的代码变更，指出潜在缺陷并给出修改建议。',
        model: 'qwen3-max', approval: 'ask', rounds: 15, context: 500,
        tools: ['code_interpreter'], created: '2026-09-18 13:22', deleted: false,
      },
      {
        id: 'ag-case', name: '用例生成器', level: 'user',
        persona: '你是用例生成器，负责根据需求文档生成测试用例，覆盖正向、反向与边界场景。',
        model: 'deepseek-v4-pro', approval: 'auto', rounds: null, context: 200,
        tools: ['read_file'], created: '2026-09-21 15:56', deleted: false,
      },
      {
        id: 'ag-kbtidy', name: '知识整理员', level: 'user',
        persona: '你是知识整理员，负责将散落的文档整理为结构化知识条目，统一术语与格式。',
        model: 'glm-5.3-air', approval: 'auto', rounds: null, context: 200,
        tools: ['web_fetch', 'knowledge_write'], created: '2026-09-24 10:31', deleted: false,
      },
      {
        id: 'ag-fincheck', name: '财务对账员', level: 'user',
        persona: '你是财务对账员，负责核对账单与流水，定位差异并输出对账报告。',
        model: 'deepseek-v4-pro', approval: 'ask', rounds: 25, context: 200,
        tools: ['db_query', 'calc_revenue'], created: '2026-09-27 09:14', deleted: false,
      },
      {
        id: 'ag-minutes', name: '会议纪要员', level: 'user',
        persona: '你是会议纪要员，负责把会议录音整理为纪要，提取决议、行动项与负责人。',
        model: 'doubao-seed-1.6', approval: 'auto', rounds: null, context: 100,
        tools: ['speech_to_text', 'summarize_doc'], created: '2026-09-29 18:02', deleted: false,
      },
    ],
    employees: [
      { id: 'em-1',  name: '巡检分身（AI）·1',   agentId: 'ag-ops',       folderId: 'f-ops', overrides: {}, created: '2026-09-21 10:00' },
      { id: 'em-2',  name: '新同事（AI）·2',     agentId: 'ag-report',    folderId: null,    overrides: { model: 'deepseek-v4-pro' }, created: '2026-09-22 11:20' },
      { id: 'em-3',  name: '报表分身（AI）·3',   agentId: 'ag-report',    folderId: 'f-fin', overrides: {}, created: '2026-09-23 09:40' },
      { id: 'em-4',  name: '质检专员（AI）·4',   agentId: 'ag-qc',        folderId: 'f-ops', overrides: { approval: 'ask' }, created: '2026-09-24 14:12' },
      { id: 'em-5',  name: '舆情哨兵（AI）·5',   agentId: 'ag-sentiment', folderId: 'f-ops', overrides: {}, created: '2026-09-25 10:05' },
      { id: 'em-6',  name: '合同审阅（AI）·6',   agentId: 'ag-contract',  folderId: 'f-fin', overrides: {}, created: '2026-09-26 16:48' },
      { id: 'em-7',  name: '数据标注（AI）·7',   agentId: 'ag-label',     folderId: null,    overrides: {}, created: '2026-09-27 11:33' },
      { id: 'em-8',  name: '会议纪要（AI）·8',   agentId: 'ag-minutes',   folderId: null,    overrides: {}, created: '2026-09-28 15:20' },
      { id: 'em-9',  name: '代码评审（AI）·9',   agentId: 'ag-cr',        folderId: null,    overrides: { tools: [] }, created: '2026-09-29 09:57' },
      { id: 'em-10', name: '对账专员（AI）·10',  agentId: 'ag-fincheck',  folderId: 'f-fin', overrides: {}, created: '2026-09-30 13:41' },
      { id: 'em-11', name: '简历筛选（AI）·11',  agentId: 'ag-hr',        folderId: null,    overrides: {}, created: '2026-10-01 10:26' },
      { id: 'em-12', name: '知识整理（AI）·12',  agentId: 'ag-kbtidy',    folderId: 'f-ops', overrides: {}, created: '2026-10-02 14:59' },
      { id: 'em-13', name: '用例生成（AI）·13',  agentId: 'ag-case',      folderId: null,    overrides: {}, created: '2026-10-03 17:15' },
    ],
    folders: [
      { id: 'f-ops', name: '运营组' },
      { id: 'f-fin', name: '财务组' },
    ],
    endpoints: [
      { id: 'ep-1',  name: '主端点 · DeepSeek',    url: 'https://api.deepseek.com/v1',       key: 'sk-9f2Xk7a1demoKey0001aB', model: 'deepseek-v4-pro',   usage: '对话',     priority: 100, status: 'enabled',  created: '2026-09-01 09:00' },
      { id: 'ep-2',  name: '备用端点 · GLM',       url: 'https://open.bigmodel.cn/api/paas/v4', key: 'sk-glm8demoKey0002xYz', model: 'glm-5.3-flash',    usage: '对话',     priority: 90,  status: 'enabled',  created: '2026-09-01 09:00' },
      { id: 'ep-3',  name: '阿里百炼',             url: 'https://dashscope.aliyuncs.com/compatible-mode/v1', key: 'sk-ali7demoKey0003cD', model: 'qwen3-max',     usage: '对话',     priority: 95,  status: 'enabled',  created: '2026-09-02 10:20' },
      { id: 'ep-4',  name: '月之暗面',             url: 'https://api.moonshot.cn/v1',        key: 'sk-kim3demoKey0004eF', model: 'kimi-k2-0905',     usage: '对话',     priority: 85,  status: 'enabled',  created: '2026-09-04 11:05' },
      { id: 'ep-5',  name: '火山方舟 · 豆包',      url: 'https://ark.cn-beijing.volces.com/api/v3', key: 'sk-db5demoKey0005gH', model: 'doubao-seed-1.6', usage: '对话',     priority: 88,  status: 'enabled',  created: '2026-09-06 15:42' },
      { id: 'ep-6',  name: '备用端点 · DeepSeek 2', url: 'https://api.deepseek.com/v1',       key: 'sk-ds6demoKey0006iJ',  model: 'deepseek-v4-pro',   usage: '对话',     priority: 80,  status: 'enabled',  created: '2026-09-08 09:18' },
      { id: 'ep-7',  name: '智谱 · GLM Air',       url: 'https://open.bigmodel.cn/api/paas/v4', key: 'sk-gl7demoKey0007kL', model: 'glm-5.3-air',     usage: '对话',     priority: 70,  status: 'enabled',  created: '2026-09-10 14:55' },
      { id: 'ep-8',  name: 'DeepSeek Flash',       url: 'https://api.deepseek.com/v1',        key: 'sk-ds8demoKey0008mN',  model: 'deepseek-v4-flash', usage: '对话',     priority: 75,  status: 'enabled',  created: '2026-09-12 16:37' },
      { id: 'ep-9',  name: '旧网关 · 测试',        url: 'https://bad-gateway.internal.example.com/v1', key: 'sk-old9demoKey0009oP', model: 'legacy-2.0', usage: '测试', priority: 10,  status: 'disabled', created: '2026-09-14 08:40' },
      { id: 'ep-10', name: '临时接入 · 审核中',    url: 'https://api.vendor-x.com/v1',        key: 'sk-wrongKey0010qR',    model: 'vendor-x-pro',     usage: '对话',     priority: 50,  status: 'disabled', created: '2026-09-16 19:26' },
      { id: 'ep-11', name: '百炼备用',             url: 'https://dashscope.aliyuncs.com/compatible-mode/v1', key: 'sk-al1demoKey0011sT', model: 'qwen3-plus',    usage: '对话',     priority: 65,  status: 'enabled',  created: '2026-09-20 13:58' },
      { id: 'ep-12', name: 'Kimi 长文端点',        url: 'https://api.moonshot.cn/v1',         key: 'sk-ki2demoKey0012uV',  model: 'kimi-k2-0905',     usage: '长文总结', priority: 60,  status: 'enabled',  created: '2026-09-25 17:44' },
    ],
    conversations: [],   // {id, mode, employeeId, title, updatedAt, status, permMode, model, messages:[...], ctx:{compressedRounds, warned}}
    usageLogs: [],       // model.call 落库（本期只记录不展示，PRD-2 成本中心使用）
    empSeq: 14,          // 员工自动编号
  };
}

/* ---------- 推荐问题（静态配置） ---------- */
const SUGGESTED_QUESTIONS = [
  '演示一下你的 Markdown 渲染能力',
  '画一个项目排期甘特图',
  '抓取 https://example.com 并总结要点',
];

/* ---------- 剧本回复 ---------- */
const SCRIPT_MD = {
  thinking: '用户想看我演示 Markdown 渲染能力。这是一个展示类请求，不需要调用工具。我应该覆盖最常用的格式：标题、强调、代码、表格、任务列表、引用、提示块、公式和折叠面板，组织成一个有层次的演示文档，并在末尾给出可以继续追问的方向。',
  tools: [],
  content: [
    '# Markdown 渲染演示',
    '',
    '我支持**加粗**、*斜体*、~~删除线~~与`行内代码`，也支持组合使用，例如 ***加粗斜体*** 和 `const x = 42;`。',
    '',
    '## 代码块',
    '',
    '```javascript',
    '// 继承-覆盖：员工生效配置 = 自定义值 ?? 智能体配置',
    'function effective(employee, agent, field) {',
    '  const override = employee.overrides[field];',
    '  return override !== undefined ? override : agent[field];',
    '}',
    '```',
    '',
    '## 表格',
    '',
    '| 模块 | 优先级 | 预估工时 | 依赖 |',
    '|---|---|---|---|',
    '| 全局壳 + 登录与用户中心 | P0 | 0.6 人月 | 无 |',
    '| 模型中心端点管理 | P0 | 0.5 人月 | 阶段 1 |',
    '| 工作台对话 + 富文本 | P0 | 1.5 人月 | 阶段 2 |',
    '| 智能体中心 | P0 | 0.5 人月 | 阶段 2 |',
    '| 数字员工 | P0 | 0.8 人月 | 阶段 3、4 |',
    '',
    '## 任务列表',
    '',
    '- [x] 接入模型端点并连通测试',
    '- [x] 定义智能体能力剖面',
    '- [ ] 派生数字员工并移入部门文件夹',
    '- [ ] 完成冒烟演示脚本走查',
    '',
    '## 引用与提示块',
    '',
    '> 设计原则：用户不只是和 AI 聊天，而是创建、配置、管理一批能干活的 AI 员工。',
    '',
    '> [!NOTE]',
    '> 智能体是能力模板（岗位说明书），数字员工是派生实例（入职的同事）。',
    '',
    '> [!WARNING]',
    '> 删除被员工引用的智能体会被阻断，请先删除或转移相关员工。',
    '',
    '---',
    '',
    '## 行内公式',
    '',
    '上下文用量占比 $p = \\frac{u_{used}}{u_{limit}} \\times 100\\%$，达 $80\\%$ 预警、$90\\%$ 自动压缩。',
    '',
    '<details>',
    '<summary>展开查看：脚注与折叠面板演示</summary>',
    '',
    '折叠面板内的内容同样支持完整 Markdown 渲染，适合放置补充说明、参数细节等次级信息。',
    '',
    '</details>',
    '',
    '以上是本期支持的主要格式[^1]。',
    '',
    '[^1]: 数学公式与 Mermaid 图表同样支持，可直接对我说「写个公式」或「画个甘特图」。',
  ].join('\n'),
  followups: ['画一个项目排期甘特图', '写一个数学公式演示', '抓取 https://example.com 并总结要点'],
};

const SCRIPT_GANTT = {
  thinking: '用户想看甘特图。我用 Mermaid 的 gantt 语法画一个 P0 波次的迭代排期，并配一张里程碑表说明各阶段依赖，再用行内公式给出总工时估算。图表渲染出来后用户可以使用全屏和缩放功能查看。',
  tools: [],
  content: [
    '好的，这是 **Phoenix P0 波次**的排期甘特图（按 PRD-1 第 7 章排期建议绘制）：',
    '',
    '```mermaid',
    'gantt',
    '    title Phoenix P0 迭代排期（约 3.9 人月）',
    '    dateFormat  YYYY-MM-DD',
    '    axisFormat  %m-%d',
    '    section 阶段 1-2',
    '    全局壳 + 登录与用户中心      :a1, 2026-10-09, 6d',
    '    模型中心端点管理             :a2, after a1, 5d',
    '    section 阶段 3',
    '    工作台对话 + 富文本渲染      :crit, a3, after a2, 15d',
    '    section 阶段 4-5',
    '    智能体中心                   :a4, after a3, 5d',
    '    数字员工（继承-覆盖）        :a5, after a4, 8d',
    '    section 收尾',
    '    联调 + 冒烟走查              :a6, after a5, 4d',
    '```',
    '',
    '点击图表右上角按钮可**全屏查看**，支持缩放与适应窗口。',
    '',
    '## 里程碑说明',
    '',
    '| 里程碑 | 内容 | 产出物 |',
    '|---|---|---|',
    '| M1 | 能登录、能配端点 | 可用底座 |',
    '| M2 | 能对话（流式 + 思考链 + 工具卡片） | 主链路贯通 |',
    '| M3 | 智能体派生员工、配置继承生效 | 完整 P0 |',
    '',
    '总工时为各阶段之和：$T = 0.6 + 0.5 + 1.5 + 0.5 + 0.8 = 3.9$（人月），其中工作台对话占比 $\\frac{1.5}{3.9} \\approx 38.5\\%$，是最大风险项，已优先排期。',
  ].join('\n'),
  followups: ['演示一下你的 Markdown 渲染能力', '写一个数学公式演示', '把排期压缩到 3 人月怎么做'],
};

const SCRIPT_FORMULA = {
  thinking: '用户想看数学公式渲染。我选几个有代表性的：欧拉恒等式（行内）、二次方程求根公式（块级）、以及一个与产品相关的上下文压缩阈值公式，展示 KaTeX 的排版效果。',
  tools: [],
  content: [
    '以下是 LaTeX 公式渲染演示：',
    '',
    '**行内公式**：最美的恒等式之一 $e^{i\\pi} + 1 = 0$，以及质能方程 $E = mc^2$。',
    '',
    '**块级公式**：一元二次方程 $ax^2 + bx + c = 0$ 的求根公式为',
    '',
    '$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$',
    '',
    '**上下文自动压缩**的触发条件可以形式化为：设已用量为 $u$，上限为 $L$，则',
    '',
    '$$\\text{action}(u) = \\begin{cases} \\text{正常} & u < 0.8L \\\\ \\text{预警} & 0.8L \\le u < 0.9L \\\\ \\text{压缩} & u \\ge 0.9L \\end{cases}$$',
    '',
    '压缩后保留最近 $n = 10$ 轮原文，早期内容压为摘要继续参与上下文。',
  ].join('\n'),
  followups: ['画一个项目排期甘特图', '演示一下你的 Markdown 渲染能力', '上下文压缩会影响回答质量吗'],
};

const SCRIPT_FETCH = {
  thinking: '用户要求抓取网页并总结。我有 web_fetch 工具权限，先调用它抓取目标页面，拿到正文后提炼要点：这是一个演示域名页面，内容很简短，我按「是什么、用来做什么、注意事项」三段式总结，并标注信息来源。',
  tools: [
    { name: 'web_fetch', args: { url: 'https://example.com' }, duration: 860, ok: true },
  ],
  content: [
    '已完成抓取与总结：',
    '',
    '## 页面摘要：Example Domain',
    '',
    '| 项目 | 内容 |',
    '|---|---|',
    '| 来源 | [example.com](https://example.com) |',
    '| 性质 | IANA 保留的演示域名 |',
    '| 用途 | 供文档、示例、测试场景引用，无需注册 |',
    '',
    '**核心要点**：',
    '',
    '1. 该域名由 IANA 维护，专供示例使用，不会指向真实业务；',
    '2. 在 PRD、测试用例中引用它，可以避免误触真实站点；',
    '3. 页面本身无敏感信息，适合作为联网抓取能力的最小验证。',
    '',
    '> [!NOTE]',
    '> 本次调用的工具、入参与耗时已展示在上方工具卡片中，每次调用都会落库一条 `model.call` 明细（含 token 与 traceId）。',
  ].join('\n'),
  followups: ['这次抓取的 Trace 在哪里看', '再抓一个网页对比要点', '演示一下你的 Markdown 渲染能力'],
};

const SCRIPT_FETCH_DENIED = {
  thinking: '用户要求抓取网页，但我检查了自己的工具授权清单，web_fetch 并未授权给我。按照规则我不能假装完成抓取，必须如实说明，并给出开启授权的路径。',
  tools: [],
  content: [
    '我当前**未被授权 `web_fetch` 工具**，无法联网抓取，也不会假装完成这个请求。',
    '',
    '开启方式：',
    '',
    '1. 若我是数字员工：在右侧「配置」里将**工具授权**切换为自定义并勾选 `web_fetch`（对话权限模式为「询问审批」时，执行前需确认）；',
    '2. 若希望批量生效：在**智能体中心**编辑我引用的智能体，授权后下一请求即对「跟随」状态的员工生效。',
    '',
    '> [!WARNING]',
    '> 对话权限模式为「询问审批」时，工具执行前会要求确认。',
  ].join('\n'),
  followups: ['演示一下你的 Markdown 渲染能力', '画一个项目排期甘特图', '写一个数学公式演示'],
};

const SCRIPT_DEFAULT = SCRIPT_MD;

/* 关键词 → 剧本 */
const SCRIPT_RULES = [
  { keys: ['甘特', '图表', '排期', '进度', 'mermaid', 'gantt'], script: SCRIPT_GANTT },
  { keys: ['公式', '数学', 'latex', '方程', 'katex'], script: SCRIPT_FORMULA },
  { keys: ['网页', '抓取', 'fetch', 'http', '链接', '总结这篇', 'example.com'], script: SCRIPT_FETCH, needTool: 'web_fetch' },
  { keys: ['markdown', '渲染', '演示', '能力', '格式'], script: SCRIPT_MD },
];

function matchScript(text) {
  const t = (text || '').toLowerCase();
  for (const rule of SCRIPT_RULES) {
    if (rule.keys.some(k => t.includes(k.toLowerCase()))) return rule;
  }
  return { script: SCRIPT_DEFAULT };
}
