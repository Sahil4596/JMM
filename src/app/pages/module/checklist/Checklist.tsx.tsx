import React, {useState, useEffect, useMemo, useCallback} from 'react'
import Pagination from 'sr/helpers/ui-components/dashboardComponents/Pagination'
import {AiOutlineClose, AiOutlineFilter, AiOutlinePlus} from 'react-icons/ai'
import {Button} from 'sr/helpers'
import Filter from 'sr/helpers/ui-components/Filter'
import {useSelector} from 'react-redux'
import {useActions} from 'sr/utils/helpers/useActions'
import {RootState} from 'sr/redux/store'
import DashboardWrapper from 'app/pages/dashboard/DashboardWrapper'
import {deleteChat} from 'sr/utils/api/deleteChat'
import DynamicModal from 'sr/helpers/ui-components/DynamicPopUpModal'
import {createChat} from 'sr/utils/api/createChat'
import {getPreSignedURL} from 'sr/utils/api/media'
import {updateChat} from 'sr/utils/api/updateChat'
import {FieldsArray} from 'sr/constants/fields'
import {useQuery} from '@tanstack/react-query'
import PaginationSkeleton from 'sr/helpers/ui-components/dashboardComponents/PaginationSkeleton'
import {
  Checklist,
  fetchChecklists,
  useCreateChecklist,
  useUpdateChecklist,
} from 'sr/utils/api/checklistApi'
import ChecklistTable from './ChecklistTable'
import SkeletonTable from 'sr/helpers/ui-components/SkeletonTable'

interface Filters {
  company_id?: string
  customer_id?: string
  type?: string
  subtype?: string
  status?: string
}
interface ChecklistCreatePayload {
  name: string
  type: string
  subtype: string
  company_id: string
  customer_id: string
  task_ids: string[]
  status: string
}
interface ChecklistUpdatePayload extends ChecklistCreatePayload {
  id: string
}

const Custom: React.FC = () => {
  const [selectedData, setSelectedData] = useState<Checklist>()
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [filters, setFilters] = useState<Filters>()
  const [isFilterVisible, setIsFilterVisible] = useState<boolean>(false)
  const companyData = useSelector((state: RootState) => state.company.data)
  const companyStatus = useSelector((state: RootState) => state.company.status)
  const customerData = useSelector((state: RootState) => state.customer.data)
  const customerStatus = useSelector((state: RootState) => state.customer.status)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false)
  const {fetchCompanyData, fetchCustomersData} = useActions()
  const [itemsPerPage, setItemsPerPage] = useState<number>(8)
  const createMutation = useCreateChecklist()
  const updateMutation = useUpdateChecklist()

  const createFields: FieldsArray = useMemo(
    () => [
      {
        type: 'text',
        label: 'Name',
        name: 'name',
        placeholder: 'Name',
        required: true,
      },

      {
        type: 'dropdown',
        label: 'company_id',
        name: companyData,
        topLabel: 'Company',
        placeholder: 'Select Company',
        labelKey: 'company_name',
        required: true,
      },
      {
        type: 'dropdown',
        label: 'customer_id',
        name: customerData,
        topLabel: 'Customer',
        placeholder: 'Select Customer',
        labelKey: 'customer_name',
        required: true,
      },
      {
        type: 'dropdown',
        label: 'type',
        name: [
          {name: 'Daily', id: 'Daily'},
          {name: 'Weekly', id: 'Weekly'},
        ],
        topLabel: 'Type',
        placeholder: 'Select Type',
        labelKey: 'name',
        id: 'id',
        required: true,
      },
      {
        type: 'dropdown',
        label: 'subtype',
        name: [
          {name: 'Office', id: 'Office'},
          {name: 'Hospital', id: 'Hospital'},
        ],
        topLabel: 'Sub Type',
        placeholder: 'Select Sub Type',
        labelKey: 'name',
        id: 'id',
        required: true,
      },
      {
        type: 'dropdown',
        label: 'status',
        name: [
          {name: 'Active', id: 'active'},
          {name: 'Draft', id: 'draft'},
        ],
        topLabel: 'Status',
        placeholder: 'Select Status',
        labelKey: 'name',
        id: 'id',
        required: true,
      },
    ],
    [companyData, customerData]
  )

  const fields: FieldsArray = useMemo(
    () => [
      {
        type: 'dropdown',
        label: 'company_id',
        name: companyData,
        topLabel: 'Company',
        placeholder: 'Select company',
        labelKey: 'company_name',
        id: 'id',
      },
      {
        type: 'dropdown',
        label: 'customer_id',
        name: customerData,
        topLabel: 'Customer',
        placeholder: 'Select Customer',
        labelKey: 'customer_name',
        id: 'id',
      },
      {
        type: 'dropdown',
        label: 'type',
        name: [
          {name: 'Weekly', id: 'Weekly'},
          {name: 'Daily', id: 'Daily'},
        ],
        topLabel: 'Type',
        placeholder: 'Select Type',
      },
      {
        type: 'dropdown',
        label: 'subtype',
        name: [
          {name: 'Office', id: 'Office'},
          {name: 'Hospital', id: 'Hospital'},
        ],
        topLabel: 'Sub Type',
        placeholder: 'Select Sub Type',
      },
      {
        type: 'dropdown',
        label: 'status',
        name: [
          {name: 'Active', id: 'active'},
          {name: 'Draft', id: 'draft'},
        ],
        topLabel: 'Status',
        placeholder: 'Select Status',
        labelKey: 'name',
        id: 'id',
      },
    ],
    [companyData, customerData]
  )

  const {data, isLoading, refetch} = useQuery({
    queryKey: ['checklist', {limit: itemsPerPage, page: currentPage, ...filters}],
    queryFn: async () => fetchChecklists({limit: itemsPerPage, page: currentPage, ...filters}),
    // placeholderData: keepPreviousData,
  })
  useEffect(() => {
    fetchDataIfNeeded()
  }, [])

  const fetchDataIfNeeded = useCallback(() => {
    if (companyStatus !== 'succeeded') {
      fetchCompanyData({})
    }
    if (customerStatus !== 'succeeded') {
      fetchCustomersData({})
    }
  }, [companyStatus, fetchCompanyData, customerStatus, fetchCustomersData])

  const onPageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }
  const onLimitChange = (newLimit: number) => {
    setItemsPerPage(newLimit)
    setCurrentPage(1)
  }
  const handleApplyFilter = (newFilters: any) => {
    setFilters(newFilters)
    setCurrentPage(1)
    setIsFilterVisible(false)
  }

  const handleCreateChecklist = async (payload: ChecklistCreatePayload) => {
    const data: ChecklistCreatePayload = {
      name: payload.name,
      type: payload.type,
      subtype: payload.subtype,
      company_id: payload.company_id,
      customer_id: payload.customer_id,
      task_ids: [],
      status: payload.status,
    }
    setIsCreateModalOpen(false)
    createMutation.mutate(data)
  }
  const handleEditChecklist = async (payload: ChecklistUpdatePayload) => {
    if (!selectedData) {
      setIsUpdateModalOpen(false)
      return
    }
    setIsUpdateModalOpen(false)
    const data: ChecklistUpdatePayload = {
      name: payload.name,
      type: payload.type,
      subtype: payload.subtype,
      company_id: payload.company_id,
      customer_id: payload.customer_id,
      task_ids: [],
      status: payload.status,
      id: selectedData.id,
    }
    updateMutation.mutate({payload: data})
  }
  const defaultValues: ChecklistUpdatePayload | undefined = useMemo(() => {
    if (!selectedData) return undefined
    return {
      name: selectedData.name,
      type: selectedData.type,
      subtype: selectedData.subtype,
      company_id: selectedData.company_id._id,
      customer_id: selectedData.customer_id._id,
      task_ids: [] as string[],
      status: selectedData.status,
      id: selectedData.id,
    }
  }, [selectedData])

  const handleView = async (fileUrl: string) => {
    const response: any = await getPreSignedURL({fileName: fileUrl})
    window.open(response.results.url.toString(), '_blank')
  }

  return (
    <>
      <div className='container mx-auto px-4 sm:px-8'>
        <div className='py-4'>
          <div className='flex justify-between items-center flex-wrap mb-4'>
            <h2 className='text-2xl font-semibold leading-tight mb-2 sm:mb-0 sm:mr-4'>Checklist</h2>
            <div className='flex items-center'>
              <Button
                label='Create new'
                Icon={AiOutlinePlus}
                onClick={() => setIsCreateModalOpen(true)}
                className='bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-full shadow-md inline-flex items-center mb-2 sm:mb-0 sm:mr-3'
              ></Button>
              <Button
                label={`${isFilterVisible ? 'Close' : 'Filters'}`}
                Icon={!isFilterVisible ? AiOutlineFilter : AiOutlineClose}
                onClick={() => setIsFilterVisible(!isFilterVisible)}
                className={`text-gray-800 font-bold py-2 px-4 rounded-full shadow-md inline-flex items-center ${
                  isFilterVisible ? 'bg-red-400 hover:bg-red-500' : 'bg-gray-200 hover:bg-gray-300'
                }`}
              ></Button>
            </div>
          </div>
          {isFilterVisible && (
            <div className='relative'>
              <Filter
                onApplyFilter={handleApplyFilter}
                setIsFilterVisible={setIsFilterVisible}
                preFilters={filters || {}}
                fields={fields}
              />
            </div>
          )}
          {isLoading ? (
            <SkeletonTable
              columns={[
                'Name',
                'Type',
                'SubType',
                'Company Name',
                'Customer Name',
                'Status',
                'Actions',
              ]}
            />
          ) : (
            <ChecklistTable
              setSelectedData={setSelectedData}
              setIsUpdateModalOpen={setIsUpdateModalOpen}
              data={data?.data}
              //   handleDelete={onDeleteChat}
              //   handleView={handleView}
            />
          )}
        </div>
        {isLoading ? (
          <PaginationSkeleton />
        ) : (
          <Pagination
            currentPage={currentPage}
            totalPages={
              Math.ceil((data?.pagination?.total || 1) / (data?.pagination?.pageSize || 1)) || 0
            }
            totalResults={data?.pagination?.total}
            onPageChange={onPageChange}
            itemsPerPage={itemsPerPage}
            name='checklist'
            onLimitChange={onLimitChange}
            disabled={isLoading}
          />
        )}
      </div>
      {isCreateModalOpen && (
        <DynamicModal
          label='Create Checklist'
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          fields={createFields}
          onSubmit={handleCreateChecklist}
        />
      )}
      {isUpdateModalOpen && defaultValues && (
        <DynamicModal
          label='Update Checklist'
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          fields={createFields}
          defaultValues={defaultValues}
          onSubmit={handleEditChecklist}
        />
      )}
    </>
  )
}
const ChecklistCard: React.FC = () => {
  return (
    <>
      <DashboardWrapper customComponent={Custom} selectedItem={'/checklist'}></DashboardWrapper>
    </>
  )
}

export default ChecklistCard
