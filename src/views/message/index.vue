<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.messageId" placeholder="Message Id" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.appId" placeholder="App ID" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.messageClass" placeholder="Message Class" clearable class="filter-item" style="width: 130px">
        <el-option v-for="item in messageClasses" :key="item.value" :label="item.name" :value="item.value" />
      </el-select>
      <el-select v-model="listQuery.status" placeholder="Status" clearable class="filter-item" style="width: 130px">
        <el-option v-for="item in statuses" :key="item.value" :label="item.name" :value="item.value" />
      </el-select>
      <el-date-picker v-model="listQuery.receiveDateFrom" type="datetime" format="yyyy-MM-dd HH:mm:ss" placeholder="Receive Date" class="filter-item" />
      <el-date-picker v-model="listQuery.receiveDateTo" type="datetime" format="yyyy-MM-dd HH:mm:ss" placeholder="Receive Date" class="filter-item" />
      <el-date-picker v-model="listQuery.sendDateFrom" type="datetime" format="yyyy-MM-dd HH:mm:ss" placeholder="Receive Date" class="filter-item" />
      <el-date-picker v-model="listQuery.sendDateTo" type="datetime" format="yyyy-MM-dd HH:mm:ss" placeholder="Receive Date" class="filter-item" />
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
      <el-table-column align="center" :label="$t('id')" type="index" width="50px" />
      <el-table-column :label="$t('app.appId')" width="300px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.appId }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('app.appSecurity')" width="250px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.appSecurity | uuidMaskFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('app.owner')" width="200px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.ownerEmail }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('app.status')" class-name="status-col" width="100px">
        <template slot-scope="{row}">
          <el-tag :type="row.status | statusFilter">
            {{ row.status | code2Name }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('actions')" align="center" width="300px" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleSwitchStatus(row)">
            {{ row.status === '100801' ? $t('disable'): $t('enable') }}
          </el-button>
          <el-button type="warning" size="mini" @click="handleResetAppSecurity(row)">
            {{ $t('reset') }}
          </el-button>
          <el-button size="mini" @click="handleUpdate(row)">
            {{ $t('edit') }}
          </el-button>
          <el-button type="danger" size="mini" @click="handleDelete(row)">
            {{ $t('delete') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.current" :limit.sync="listQuery.size" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="100px" style="width: 500px; margin-left:50px;">
        <el-form-item :label="$t('app.appId')" prop="appId">
          <el-input v-model="temp.appId" disabled />
        </el-form-item>
        <el-form-item :label="$t('app.appSecurity')" prop="appSecurity">
          <el-input v-model="temp.appSecurity" disabled />
        </el-form-item>
        <el-form-item :label="$t('app.owner')" prop="owner">
          <el-input v-model="temp.ownerEmail" :placeholder="$t('app.ownerEmail')" />
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
import { fetchList, resendMessage } from '@/api/message'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { getCodes } from '@/utils/dict'

export default {
  name: 'Message',
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      messageClasses: getCodes('1021'),
      statuses: getCodes('1020'),
      listLoading: true,
      listQuery: {
        current: 1,
        size: 20,
        messageId: undefined,
        appId: undefined,
        status: undefined,
        messageClass: undefined,
        receiveDateFrom: undefined,
        receiveDateTo: undefined,
        sendDateFrom: undefined,
        sendDateTo: undefined
      },
      temp: {
        id: undefined,
        ownerEmail: undefined,
        appId: undefined,
        appSecurity: undefined
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: this.$t('edit'),
        create: this.$t('create')
      },
      rules: {
      },
      downloadLoading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
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
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleResendMessage(row) {
      this.$confirm(this.$t('updateStatusWarning'), this.$t('warning'), {
        confirmButtonText: this.$t('confirm'),
        cancelButtonText: this.$t('cancel'),
        type: 'warning'
      }).then(() => {
        resendMessage(row).then(data => {
          for (const v of this.list) {
            if (v.id === data.id) {
              const index = this.list.indexOf(v)
              this.list.splice(index, 1, data)
              break
            }
          }
          this.$notify({
            title: this.$t('success'),
            message: this.$t('updateSuccessfully'),
            type: 'success',
            duration: 2000
          })
        })
      })
    }
  }
}
</script>
