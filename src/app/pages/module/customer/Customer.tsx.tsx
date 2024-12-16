import React, {useState, useEffect, useMemo, useCallback} from 'react'
import Pagination from 'sr/helpers/ui-components/dashboardComponents/Pagination'
import {AiOutlineFilter, AiOutlinePlus} from 'react-icons/ai'
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
import {UserInterface} from 'sr/constants/User'
import {useQuery} from '@tanstack/react-query'
import PaginationSkeleton from 'sr/helpers/ui-components/dashboardComponents/PaginationSkeleton'
import SkeletonCompanyTable from './SkeletonCustomerTable'
import CompanyTable from './CustomerTable'
import {fetchCustomers} from 'sr/utils/api/customerApi'
import SkeletonCustomerTable from './SkeletonCustomerTable'
import CustomerTable from './CustomerTable'

interface chatApiResponse {
  eightySixResponseId?: any
  senderId?: UserInterface
  receiverId?: UserInterface
  sourceType?: string
  message?: string
  images?: string[]
  msgType?: number
  createdAt: string
  updatedAt: string
  id: string
}

interface chatFilters {
  senderId?: string
  receiverId?: string
  eightySixResponseId?: string
  sourceType?: string
}
interface chatCreatePayload {
  eightySixResponseId: string
  receiverId: string
  sourceType: string
  message: string
  images: string[]
  msgType: number
}
interface defaultData {
  eightySixResponseId?: string
  receiverId?: string
  sourceType?: string
  message?: string
  images?: string[]
  msgType?: number
}
interface chatUpdatePayload extends chatCreatePayload {}

const Custom: React.FC = () => {
  const [selectedData, setSelectedData] = useState<chatApiResponse>()
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [filters, setFilters] = useState<chatFilters>()
  const [isFilterVisible, setIsFilterVisible] = useState<boolean>(false)
  const userData = useSelector((state: RootState) => state.user.data)
  const userStatus = useSelector((state: RootState) => state.user.status)
  const companyData = useSelector((state: RootState) => state.company.data)
  const companyStatus = useSelector((state: RootState) => state.company.status)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false)
  const {fetchUserData, fetchCompanyData} = useActions()
  const [itemsPerPage, setItemsPerPage] = useState(8)

  const createFields: FieldsArray = useMemo(
    () => [
      {
        type: 'text',
        label: 'Username',
        name: 'username',
        placeholder: 'Username',
        required: true,
      },
      {
        type: 'text',
        label: 'Password',
        name: 'password',
        placeholder: 'Password',
        required: true,
      },
      {
        type: 'text',
        label: 'Email',
        name: 'email',
        placeholder: 'Email',
        required: true,
      },
      {
        type: 'text',
        label: 'Mobile',
        name: 'mobile_number',
        placeholder: 'Mobile',
        required: true,
      },
      {
        type: 'text',
        label: 'Company Name',
        name: 'company_name',
        placeholder: 'Company Name',
        required: true,
      },
      {
        type: 'text',
        label: 'Username',
        name: 'username',
        placeholder: 'Username',
        required: true,
      },
      {
        type: 'text',
        label: 'Business Type',
        name: 'business_type',
        placeholder: 'Business Type',
        required: true,
      },
      {
        type: 'text',
        label: 'Intent',
        name: 'intent',
        placeholder: 'Intent',
        required: true,
      },
      {
        type: 'text',
        label: 'Candidate Message',
        name: 'candidate_msg',
        placeholder: 'Candidate Message',
        required: true,
      },
    ],
    []
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
        label: 'type',
        name: [
          {name: 'Airport', id: 'Airport'},
          {name: 'Corporate', id: 'Corporate'},
          {
            name: 'Hospital',
            id: 'Hospital',
          },
        ],
        topLabel: 'Type',
        placeholder: 'Select Type',
      },
      {
        type: 'dropdown',
        label: 'status',
        name: [
          {name: 'Pending OTP', id: 'pending_otp'},
          {name: 'Active', id: 'active'},
        ],
        topLabel: 'Status',
        placeholder: 'Select Status',
        labelKey: 'name',
        id: 'id',
      },
    ],
    [companyData]
  )

  const {data, error, isLoading, isError, refetch} = useQuery({
    queryKey: ['customer', {limit: itemsPerPage, page: currentPage, ...filters}],
    queryFn: async () => fetchCustomers({limit: itemsPerPage, page: currentPage, ...filters}),
    // placeholderData: keepPreviousData,
  })
  useEffect(() => {
    fetchUserDataIfNeeded()
  }, [])

  const defaultValues: defaultData | undefined = useMemo(() => {
    if (!selectedData) return undefined
    return {
      eightySixResponseId: selectedData.eightySixResponseId?.id,
      sourceType: selectedData.sourceType,
      message: selectedData.message,
      images: selectedData.images,
      msgType: selectedData.msgType,
      receiverId: selectedData.receiverId?.id,
    }
  }, [selectedData])
  const fetchUserDataIfNeeded = useCallback(() => {
    if (companyStatus !== 'succeeded') {
      fetchCompanyData({})
    }
  }, [companyStatus, fetchCompanyData])

  const onDeleteChat = async (id: string) => {
    const res = await deleteChat(id)
    if (!res) {
      return
    }
    refetch()
  }
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

  const handleCreateChat = async (payload: chatCreatePayload) => {
    setIsCreateModalOpen(false)
    const res = await createChat(payload)
    if (!res) {
      setIsCreateModalOpen(false)
      return
    }
    refetch()
  }
  const handleEditChat = async (payload: chatUpdatePayload) => {
    if (!selectedData) {
      setIsUpdateModalOpen(false)
      return
    }
    setIsUpdateModalOpen(false)
    const res = await updateChat(payload, selectedData.id)
    if (!res) {
      setIsUpdateModalOpen(false)
      return
    }
    refetch()
  }

  const handleView = async (fileUrl: string) => {
    const response: any = await getPreSignedURL({fileName: fileUrl})
    window.open(response.results.url.toString(), '_blank')
  }

  return (
    <>
      <div className='container mx-auto px-4 sm:px-8'>
        <div className='py-4'>
          <div className='flex justify-between items-center flex-wrap mb-4'>
            <h2 className='text-2xl font-semibold leading-tight mb-2 sm:mb-0 sm:mr-4'>Customer</h2>
            <div className='flex items-center'>
              <Button
                label='Create new'
                Icon={AiOutlinePlus}
                onClick={() => setIsCreateModalOpen(true)}
                className='bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-full shadow-md inline-flex items-center mb-2 sm:mb-0 sm:mr-3'
              ></Button>
              <Button
                label='Filter'
                Icon={AiOutlineFilter}
                onClick={() => setIsFilterVisible(!isFilterVisible)}
                className='bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-full shadow-md inline-flex items-center'
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
            <SkeletonCustomerTable />
          ) : (
            <CustomerTable
              //   setSelectedData={setSelectedData}
              //   setIsUpdateModalOpen={setIsUpdateModalOpen}
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
            name='customer'
            onLimitChange={onLimitChange}
            disabled={isLoading}
          />
        )}
      </div>
      {isCreateModalOpen && (
        <DynamicModal
          label='Create Customer'
          imageType='images'
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          fields={createFields}
          onSubmit={handleCreateChat}
        />
      )}
      {/* {isUpdateModalOpen && (
        <DynamicModal
          imageType='images'
          label='Update Job'
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          fields={updateFields}
          defaultValues={defaultValues}
          onSubmit={handleEditChat}
        />
      )} */}
    </>
  )
}
const Customer: React.FC = () => {
  return (
    <>
      <DashboardWrapper customComponent={Custom} selectedItem={'/customer'}></DashboardWrapper>
    </>
  )
}

export default Customer