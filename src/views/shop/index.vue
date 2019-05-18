<template>
  <div class="app-container">
    <div class="filter-container">
      <el-cascader
        v-model="locationSelected"
        placeholder="省份/城市"
        clearable
        :options="locations"
        :props="props"
        class="filter-item"
        @change="handleItemChange"
      />
      <el-input v-model="listQuery.name" placeholder="请输入店铺名称" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
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
      <el-table-column align="center" :label="$t('employee.id')" type="index" width="60px" />
      <el-table-column label="省份" width="100px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.provinceCode }}</span>
        </template>
      </el-table-column>
      <el-table-column label="城市" width="100px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.cityCode }}</span>
        </template>
      </el-table-column>
      <el-table-column label="店铺名称" width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="地址" width="200px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.address }}</span>
        </template>
      </el-table-column>
      <el-table-column label="店铺管理员" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.shopManager }}</span>
        </template>
      </el-table-column>
      <el-table-column label="店长" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.shopAdmin }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" class-name="status-col" width="100px">
        <template slot-scope="{row}">
          <!--          <el-tag :type="row.status | statusFilter">-->
          {{ row.status }}
          <!--          </el-tag>-->
        </template>
      </el-table-column>
      <el-table-column :label="$t('actions')" align="center" width="150px" class-name="small-padding fixed-width">
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
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">
        <el-form-item label="店铺名称" prop="name">
          <el-input v-model="temp.name" />
        </el-form-item>
        <el-form-item label="省份/城市" prop="newUpdateLocationSelected">
          <el-cascader
            v-model="newUpdateLocationSelected"
            placeholder="省份/城市"
            clearable
            :options="locations"
            :props="props"
            class="filter-item"
            @change="handleItemChange"
          />
        </el-form-item>
        <el-form-item label="店铺地址" prop="address">
          <el-input v-model="temp.address" />
        </el-form-item>
        <el-form-item label="店铺管理员" prop="shopManager">
          <el-select v-model="temp.shopManager" clearable class="filter-item">
            <el-option v-for="item in shopManagers" :key="item.id" :label="item.username + '/' +item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="店长" prop="shopManager">
          <el-select v-model="temp.shopAdmin" clearable class="filter-item">
            <el-option v-for="item in shopAdmins" :key="item.id" :label="item.username + '/' +item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="店员" prop="shops">
          <el-select v-model="temp.shopUsers" multiple class="filter-item">
            <el-option v-for="item in shopUsers" :key="item.id" :label="item.username + '/' +item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="经度" prop="longitude">
          <el-input v-model="temp.longitude" />
        </el-form-item>
        <el-form-item label="纬度" prop="latitude">
          <el-input v-model="temp.latitude" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="temp.status" class="filter-item">
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
import { fetchLocations } from '@/api/location'
import { deleteEmployee, createEmployee, updateEmployee, fetchAllShopAdmins, fetchAllManagers, fetchShopUsers } from '@/api/employee'
import { fetchList } from '@/api/shop'
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
      locations: [],
      props: {
        value: 'value',
        label: 'label',
        children: 'children'
      },
      locationSelected: [],
      newUpdateLocationSelected: [],
      tableKey: 0,
      list: null,
      shopAdmins: [],
      shopUsers: [],
      shopManagers: [],
      total: 0,
      listLoading: true,
      listQuery: {
        current: 1,
        size: 20,
        name: undefined,
        province: undefined,
        city: undefined
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
        name: [{ required: true, message: '店铺名称不能为空', trigger: 'change' }],
        newUpdateLocationSelected: [{ required: true, message: '省份/城市不能空', trigger: 'change' }],
        status: [{ required: true, message: '状态不能为空', trigger: 'change' }]
      },
      downloadLoading: false
    }
  },
  created() {
    this.getLocations()
    this.getList()
    this.getEmployees()
  },
  methods: {
    handleItemChange(val) {
      console.log('active item:', val)
    },
    getLocations() {
      fetchLocations().then(response => {
        this.locations = response
      })
    },
    getList() {
      this.listLoading = true
      this.listQuery.province = this.locationSelected !== undefined ? this.locationSelected[0] : undefined
      this.listQuery.city = this.locationSelected !== undefined ? this.locationSelected[1] : undefined
      fetchList(this.listQuery).then(response => {
        this.list = response.records
        this.total = response.total
        this.listLoading = false
      })
    },
    getAllShopAdmins() {
      fetchAllShopAdmins().then(response => {
        this.shopAdmins = response
      })
    },
    getAllManagers() {
      fetchAllManagers().then(response => {
        this.shopManagers = response
      })
    },
    getShopUsers() {
      fetchShopUsers().then(response => {
        this.shopUsers = response
      })
    },
    getEmployees() {
      this.getAllManagers()
      this.getAllShopAdmins()
      this.getShopUsers()
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
