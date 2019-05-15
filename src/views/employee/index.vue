<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select v-model="listQuery.shopId" :placeholder="$t('employee.shop')" clearable style="width: 140px" class="filter-item">
        <el-option v-for="item in ownShops" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
      <el-input v-model="listQuery.nameOrUserName" :placeholder="$t('employee.nameOrUserName')" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.role" :placeholder="$t('employee.position')" clearable class="filter-item" style="width: 130px">
        <el-option v-for="item in positions" :key="item.code" :label="item.name" :value="item.code" />
      </el-select>
      <el-select v-model="listQuery.status" :placeholder="$t('employee.status')" clearable class="filter-item" style="width: 130px">
        <el-option v-for="item in positionsStatus" :key="item.code" :label="item.name" :value="item.code" />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        {{ $t('search') }}
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        {{ $t('add') }}
      </el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column align="center" :label="$t('employee.id')" type="index" width="80" />
      <el-table-column :label="$t('employee.name')" width="200px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.name + "/" + scope.row.username }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('employee.onboard_date')" width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.onboardDate }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('employee.shop_belong')" width="200px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.shops.map(shop => shop.name).join(';') }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('employee.position')" width="200px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.authorityNames | positionFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('employee.status')" class-name="status-col" width="100">
        <template slot-scope="{row}">
          <el-tag :type="row.enabled | statusFilter">
            {{ row.enabled | statusNameFilter }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('actions')" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            {{ $t('edit') }}
          </el-button>
          <el-button type="danger" size="mini" @click="handleModifyStatus(row)">
            {{ $t('delete') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.current" :limit.sync="listQuery.size" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item :label="$t('employee.name')" prop="name">
          <el-input v-model="temp.name" />
        </el-form-item>
        <el-form-item :label="$t('employee.username')" prop="username">
          <el-input v-model="temp.username" />
        </el-form-item>
        <el-form-item :label="$t('employee.position')" prop="role">
          <el-select v-model="temp.role" clearable class="filter-item" :placeholder="$t('employee.position')" @change="temp.shops=[]">
            <el-option v-for="item in positions" :key="item.code" :label="item.name" :value="item.code" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('employee.shop')" prop="shops">
          <el-select v-model="temp.shops" multiple :multiple-limit="temp.role === 'ROLE_SHOP_USER'? 1:0" class="filter-item" :placeholder="$t('employee.shop')">
            <el-option v-for="item in ownShops" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('employee.onboard_date')" prop="onboardDate">
          <el-date-picker v-model="temp.onboardDate" type="date" value-format="yyyy-MM-dd" :placeholder="$t('employee.select_date')" />
        </el-form-item>
        <el-form-item :label="$t('employee.status')" prop="enabled">
          <el-select v-model="temp.enabled" class="filter-item" :placeholder="$t('employee.status')">
            <el-option v-for="item in positionsStatus" :key="item.code" :label="item.name" :value="item.code" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          {{ $t('cancel') }}
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          {{ $t('confirm') }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { fetchList, deleteEmployee, createEmployee, updateEmployee } from '@/api/employee'
import { fetchOwns } from '@/api/shop'
import { fetchFilteredPositions } from '@/api/position'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'Employee',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      if (status) return 'success' // info
      else return 'danger'
    },
    statusNameFilter(status) {
      if (status) return '在职'
      else return '离职'
    },
    positionFilter(keys) {
      const positions = {
        'ROLE_SHOP_USER': '店员',
        'ROLE_SHOP_ADMIN': '店长',
        'ROLE_MANAGER': '管理员'
      }
      return keys && keys.map(key => positions[key]).join(';')
    }
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      ownShops: null,
      positions: null,
      positionsStatus: [{ 'code': true, 'name': '在职' }, { 'code': false, name: '离职' }],
      total: 0,
      listLoading: true,

      listQuery: {
        current: 1,
        size: 20,
        shopId: undefined,
        nameOrUserName: undefined,
        status: undefined
      },
      temp: {
        id: undefined,
        enabled: false,
        name: undefined,
        onboardDate: undefined,
        role: undefined,
        shops: [],
        username: undefined
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: this.$t('Edit'),
        create: this.$t('Create')
      },
      rules: {
        name: [{ required: true, message: '姓名不能为空', trigger: 'change' }],
        role: [{ required: true, message: '职位不能空', trigger: 'change' }],
        username: [{ required: true, message: '手机号不能空', trigger: 'change' }]
      },
      downloadLoading: false
    }
  },
  created() {
    this.getOwnShops()
    this.getFilteredPositions()
    this.getList()
  },
  methods: {
    getOwnShops() {
      fetchOwns().then(response => {
        this.ownShops = response
      })
    },
    getFilteredPositions() {
      fetchFilteredPositions().then(response => {
        this.positions = response
      })
    },
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.records
        this.total = response.total
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.current = 1
      this.getList()
    },
    handleModifyStatus(row) {
      deleteEmployee(row.id).then(response => {
        this.list.shift(row)
        this.$message({
          message: '操作成功',
          type: 'success'
        })
      })
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        enabled: false,
        name: undefined,
        onboardDate: undefined,
        role: undefined,
        shops: [],
        username: undefined
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          createEmployee(this.temp).then(data => {
            this.list.unshift(data)
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '创建成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleUpdate(row) {
      // this.temp = Object.assign({}, row)
      this.temp.id = row.id
      this.temp.enabled = row.enabled
      this.temp.name = row.name
      this.temp.onboardDate = row.onboardDate
      this.temp.role = row.authorityNames[0] || undefined
      this.temp.shops = row.shops.map(shop => shop.id)
      this.temp.username = row.username

      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          updateEmployee(tempData).then(data => {
            for (const v of this.list) {
              if (v.id === data.id) {
                const index = this.list.indexOf(v)
                this.list.splice(index, 1, data)
                break
              }
            }
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '更新成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleDelete(row) {
      this.$notify({
        title: '成功',
        message: '删除成功',
        type: 'success',
        duration: 2000
      })
      const index = this.list.indexOf(row)
      this.list.splice(index, 1)
    }
  }
}
</script>
