
<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCatDialog"
            >添加分类</el-button
          >
        </el-col>
      </el-row>

      <!-- 表格 -->
      <tree-table
        :data="catelist"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        border
        :show-row-hover="false"
        class="treetabel"
      >
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color: green"
          ></i>
          <i class="el-icon-error" v-else style="color: green"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag
            type="success"
            size="mini"
            v-else-if="scope.row.cat_level === 1"
            >二级</el-tag
          >
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button
            type="success"
            icon="el-icon-edit"
            size="mini"
            @click="showeditDailog(scope.row.cat_id)"
            >编辑</el-button
          >
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="RemoveCateByid(scope.row.cat_id)"
            >删除</el-button
          >
        </template>
      </tree-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="querInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="querInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 添加分类的对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCatDialogVisible"
      width="50%"
      @close="addCatDialogClosed"
    >
      <!-- 添加分类的表单 -->
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类:">
          <!-- options 用来指定数据源 -->
          <el-cascader
            v-model="selectedKeys"
            :options="ParentCateList"
            :props="cascaderProps"
            @change="parentCateChanged"
            clearable
            change-on-select
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCatDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 添加编辑对话框 -->
    <el-dialog
      title="编辑商品"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <el-form
        :model="editForm"
        :rules="editrules"
        ref="EditsRef"
        label-width="100px"
      >
        <el-form-item label="商品名称" prop="cat_name">
          <el-input v-model="editForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询条件
      querInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },
      // 商品分类的数据列表，默认空
      catelist: [],
      // 总数据条数
      total: 0,
      // 为table指定列的定义
      columns: [
        {
          label: "分类名称",
          prop: "cat_name",
        },
        {
          label: "是否有效",
          // 表示，将当前列定义为模板列
          type: "template",
          // 表示当前这一列使用模板名称
          template: "isok",
        },
        {
          label: "排序",
          // 表示，将当前列定义为模板列
          type: "template",
          // 表示当前这一列使用模板名称
          template: "order",
        },
        {
          label: "操作",
          // 表示，将当前列定义为模板列
          type: "template",
          // 表示当前这一列使用模板名称
          template: "opt",
        },
      ],
      // 控制添加分类对话框的显示与隐藏
      addCatDialogVisible: false,
      // 添加分类的表单数据对象
      addCateForm: {
        // 将要添加的分类名称
        cat_name: "",
        // 父级分类的id
        cat_pid: 0,
        // 分类的等级，默认要添加为一级分类
        cat_level: 0,
      },
      // 添加分类表单的验证规则对象
      addCateFormRules: {
        cat_name: [
          { required: true, message: "请输如分类名称", trigger: "blur" },
        ],
      },
      // 父级分类的列表
      ParentCateList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        value: "cat_id",
        label: "cat_name",
        chlidren: "children",
      },
      // 选中的父级分类的Id数组
      selectedKeys: [],
      // 获取到的商品编辑对象
      editForm: {},
      // 编辑商品弹窗的关闭和隐藏
      editDialogVisible: false,
      // 定义编辑商品的验证规则
      editrules: {
        cat_name: [
          { required: true, message: "请输如商品名称", trigger: "blur" },
        ],
      }
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    // 获取商品列表
    async getCateList() {
      const { data: res } = await this.$http.get("/categories", {
        params: this.querInfo,
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品列表失败");
      }
      // console.log(res.data);
      // 把数据列表赋值给 catelist
      this.catelist = res.data.result;
      // console.log(this.catelist);
      // 为总数据条数赋值
      this.total = res.data.total;
    },
    // 监听 pgesize 改变
    handleSizeChange(newSize) {
      this.querInfo.pagesize = newSize;
      this.getCateList();
    },
    // 监听 pagenum 的改变
    handleCurrentChange(newPage) {
      this.querInfo.pagenum = newPage;
      this.getCateList();
    },
    // 点击按钮展示添加商品的对话框
    showAddCatDialog() {
      // 先获取父级分类的数据列表
      this.getParentCateList();
      // 在展示出对话框
      this.addCatDialogVisible = true;
    },
    // 获取父级分类的数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get("/categories", {
        params: { type: 2 },
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取父级分类数据失败");
      }

      // console.log(res.data);
      this.ParentCateList = res.data;
    },
    // 选择项发生变化触发函数
    parentCateChanged() {
      console.log(this.selectedKeys);
      // 如果 selectedKey 数据中的 lenth 大于0，证明选中了父级分类，反之就没选
      if (this.selectedKeys.length > 0) {
        // 父级分类的Id
        this.addCateForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ];
        //  为当前分类的等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length;
        return;
      } else {
        // 父级分类的Id
        this.addCateForm.cat_pid = 0;
        //  为当前分类的等级赋值
        this.addCateForm.cat_level = 0;
      }
    },
    // 点击按钮，添加新的分类
    addCate() {
      // console.log(this.addCateForm);
      this.$refs.addCateFormRef.validate(async (vaild) => {
        if (!vaild) return;
        const { data: res } = await this.$http.post(
          "/categories",
          this.addCateForm
        );
        if (res.meta.status !== 201) {
          return this.$message.error("添加分类失败");
        }
        this.$message.success("添加分类成功");
        this.getCateList();
        this.addCatDialogVisible = false;
      });
    },
    // 监听对话框的关闭事件，重置表单数据
    addCatDialogClosed() {
      this.$refs.addCateFormRef.resetFields();
      this.selectedKeys = [];
      this.addCateForm.cat_level = 0;
      this.addCateForm.cat_pid = 0;
    },
    // 编辑商品信息
    async showeditDailog(id) {
      const { data: res } = await this.$http.get("categories/" + id);
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品列表失败");
      }
      this.editForm = res.data;
      this.editDialogVisible = true;
    },
    // 提交编辑的商品
    editCate() {
      this.$refs.EditsRef.validate(async (vaild) => {
        if (!vaild) return;
        const { data: res } = await this.$http.put(
          "categories/" + this.editForm.cat_id,
          { cat_name: this.editForm.cat_name }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("编辑商品名称失败");
        }
        this.editDialogVisible = false;
        this.getCateList();
        this.$message.success("更改商品信息成功");
      });
    },
    // 监听编辑商品窗口的关闭
    editDialogClosed() {
      this.$refs.EditsRef.resetFields();
      (this.editForm.cat_id = 0), (this.editForm.cat_name = 0);
    },
          // 根据id删除商品
    async RemoveCateByid(id) {
       const ConfirmResult = await this.$confirm("此操作将永久删除该商品, 是否继续?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }).catch(err => err);
        if(ConfirmResult !== 'confirm'){
          return this.$message.info('已经取消删除')
        }
      const {data:res} = await this.$http.delete('categories/' + id)
      if(res.meta.status !== 200){
        return this.$message.error('删除商品失败')
      }
      this.$message.success('删除商品成功')
      this.getCateList()      
  },
  },
};
</script>

<style scoped>
.treetabel {
  margin: 15px;
}
.el-cascader {
  width: 100%;
}
</style>>
