export const API_ADDRESS = 'http://148.70.14.161:1280/api';

export const FEATURE_TOGGLE = {
  switchUser: true, //切换用户
  showTaskList: true, //显示我的任务
  branchPrListsIsCard: false, //区域清单卡片式显示
  isFunctionAndPrsWithNumber: true, // 职能事项维护中显示编号
  needJumpToApprovalPage: false, //是否直接打开审批页面
  hideColorPiker: false, //是否能选择主题颜色
  isNeedCheckApprovalOrder: false, //是否检查事项审批序号间断
  canAddPrListInBranch: false, //是否能在区域新建下级清单
  canMaintenancePrFunction: true, //维护流程/事项
  canSetPositionForApproval: true, //给审批点增加岗位组选项
  canMaintenanceAuthScopeGroup: false, //授权范围
  isTrunkPrListInRootMenu: true, //金科菜单，总部清单作为菜单根目录
  canMaintenanceCoOrganizer: true, // 协办
  canAdjustPr: true, //在发布页面以职能为目录显示变更事项
  menuWithTemplateClassification: false, //顺丰菜单，显示权责手册和分类
  isShowFunctionalRowInSheet: false, // 是否在表格中显示职能行
  pr_function_display_level: 3,
  pr_display_level: 2,
  use_simple_sheet: true,
  submit_url: 'jinkedichan',
  can_batch_edit_pr: false, //批量编辑
  canEditSubPrFunctionNumber: true, //编辑职能编号
  can_edit_approval_config: true,
  onlyMaintenanceTrunkPrList: true, //只维护总部清单
  canSetOtherPermission: false,
  canMaintenancePrInBranch: true, //在区域清单中是否能维护事项
  needCheckAuthInBranch: true, // 在区域清单中校验部门人员权限
  needSubmitWithoutApprovalInBranch: true, //区域清单中显示发布不走审批
  needInheritPrInBranch: true, //区域清单中是否需要继承事项
  controlMaintenancePrLevelInBranch: false, //在区域中控制事项的编辑层级
  approvalOrderWithCircle: true, //审批序号是否带圆圈显示
  approvalMethodsWithName: false, //悬浮信息中审批符号是否显示名字
  canFilterPrRangeInBranch: false, //在区域中筛选事项范围
  directAccessTrunkDetails: false, //在菜单项中直接打开总表详情页
  showUserDetails: false, //显示用户信息弹窗
};
