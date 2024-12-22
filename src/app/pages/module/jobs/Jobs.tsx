import React, {useState, useEffect, useMemo, useCallback} from 'react'
import Pagination from 'sr/helpers/ui-components/dashboardComponents/Pagination'
import {AiOutlineClose, AiOutlineFilter, AiOutlinePlus} from 'react-icons/ai'
import {Button} from 'sr/helpers'
import Filter from 'sr/helpers/ui-components/Filter'
import {useSelector} from 'react-redux'
import {useActions} from 'sr/utils/helpers/useActions'
import {RootState} from 'sr/redux/store'
import DashboardWrapper from 'app/pages/dashboard/DashboardWrapper'
import {fetchChats} from 'sr/utils/api/fetchChats'
import {deleteChat} from 'sr/utils/api/deleteChat'
import DynamicModal from 'sr/helpers/ui-components/DynamicPopUpModal'
import {createChat} from 'sr/utils/api/createChat'
import {getPreSignedURL} from 'sr/utils/api/media'
import {updateChat} from 'sr/utils/api/updateChat'
import {FieldsArray} from 'sr/constants/fields'
import {UserInterface} from 'sr/constants/User'
import {useQuery} from '@tanstack/react-query'
import PaginationSkeleton from 'sr/helpers/ui-components/dashboardComponents/PaginationSkeleton'
import JobsTable from './JobsTable'
import {fetchJobs} from 'sr/utils/api/fetchJobs'
import SkeletonTable from 'sr/helpers/ui-components/SkeletonTable'

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

  const eightySixResponse = useMemo(
    () => [
      {firstName: 'Devid', id: '65bbf2df9aa9785b019d87b2'},
      {firstName: 'Devid', id: '65bbf2df9aa9785b019d87b2'},
    ],
    []
  )
  const msgType = useMemo(
    () => [
      {name: '1', id: 1},
      {name: '2', id: 2},
      {name: '3', id: 3},
    ],
    []
  )

  const createFields: FieldsArray = useMemo(
    () => [
      {
        type: 'dropdown',
        label: 'receiverId',
        name: userData?.results || [],
        topLabel: 'Receiver',
        placeholder: 'Select Receiver',
        required: true,
      },
      {
        type: 'dropdown',
        label: 'eightySixResponseId',
        name: eightySixResponse,
        topLabel: '86 Response',
        placeholder: 'Select 86 Response',
        required: true,
      },
      {
        type: 'dropdown',
        label: 'msgType',
        name: msgType,
        topLabel: 'Msg Type',
        placeholder: 'Select Msg Type',
        required: true,
      },
      {type: 'text', label: 'Message', name: 'message', placeholder: 'Message', required: true},
      {
        type: 'text',
        label: 'Source Type',
        name: 'sourceType',
        placeholder: 'Source Type',
        required: true,
      },
      {
        type: 'file',
        label: 'Images',
        name: 'images',
        wrapperLabel: 'Upload image',
        topLabel: 'Images',
        placeholder: 'Select Images',
        required: true,
      },
    ],
    [userData, msgType, eightySixResponse]
  )

  const updateFields: FieldsArray = useMemo(
    () => [
      {
        type: 'dropdown',
        label: 'receiverId',
        name: userData?.results || [],
        topLabel: 'Receiver',
        placeholder: 'Select Receiver',
        required: true,
      },
      {
        type: 'dropdown',
        label: 'eightySixResponseId',
        name: eightySixResponse,
        topLabel: '86 Response',
        placeholder: 'Select 86 Response',
        required: true,
      },
      {
        type: 'dropdown',
        label: 'msgType',
        name: msgType,
        topLabel: 'Msg Type',
        placeholder: 'Select Msg Type',
        required: true,
      },
      {type: 'text', label: 'Message', name: 'message', placeholder: 'Message', required: true},
      {
        type: 'text',
        label: 'Source Type',
        name: 'sourceType',
        placeholder: 'Source Type',
        required: true,
      },
      {
        type: 'file',
        label: 'Images',
        name: 'images',
        wrapperLabel: 'Upload image',
        topLabel: 'Images',
        placeholder: 'Select Images',
        required: true,
      },
    ],
    [userData, msgType, eightySixResponse]
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
        label: 'status',
        name: [
          {name: 'Open', id: 'open'},
          {name: 'Closed', id: 'closed'},
          {name: 'Active', id: 'active'},
        ],
        topLabel: 'Status',
        placeholder: 'Select Status',
        labelKey: 'name',
        id: 'id',
      },
      {
        type: 'dropdown',
        label: 'require_resume',
        name: [
          {name: 'Yes', id: true},
          {name: 'No', id: false},
        ],
        topLabel: 'Resume Required',
        placeholder: 'Select Resume Required',
        labelKey: 'name',
        id: 'id',
      },
      {
        type: 'dropdown',
        label: 'notifications',
        name: [
          {name: 'Yes', id: true},
          {name: 'No', id: false},
        ],
        topLabel: 'Notifications',
        placeholder: 'Select Notifications',
        labelKey: 'name',
        id: 'id',
      },
    ],
    [companyData]
  )

  const {data, error, isLoading, isError, refetch} = useQuery({
    queryKey: ['jobs', {limit: itemsPerPage, page: currentPage, ...filters}],
    queryFn: async () => fetchJobs({limit: itemsPerPage, page: currentPage, ...filters}),
    // placeholderData: keepPreviousData,
  })
  useEffect(() => {
    fetchDataIfNeeded()
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
  const fetchDataIfNeeded = useCallback(() => {
    if (companyStatus !== 'succeeded') {
      fetchCompanyData({limit: 0})
    }
  }, [fetchCompanyData])

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
            <h2 className='text-2xl font-semibold leading-tight mb-2 sm:mb-0 sm:mr-4'>Jobs</h2>
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
                'Company Name',
                'Job Title',
                'Start Date',
                'Max Amount',
                'Min Amount',
                'Rate',
                'Status',
                'Actions',
              ]}
            />
          ) : (
            <JobsTable
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
            name='Jobs'
            onLimitChange={onLimitChange}
            disabled={isLoading}
          />
        )}
      </div>
      {isCreateModalOpen && (
        <DynamicModal
          label='Create Job'
          imageType='images'
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          fields={createFields}
          onSubmit={handleCreateChat}
        />
      )}
      {isUpdateModalOpen && (
        <DynamicModal
          imageType='images'
          label='Update Job'
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          fields={updateFields}
          defaultValues={defaultValues}
          onSubmit={handleEditChat}
        />
      )}
    </>
  )
}
const Jobs: React.FC = () => {
  return (
    <>
      <DashboardWrapper customComponent={Custom} selectedItem={'/chat'}></DashboardWrapper>
    </>
  )
}

export default Jobs
