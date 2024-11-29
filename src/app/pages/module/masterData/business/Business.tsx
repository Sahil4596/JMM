import React, {useMemo, useState} from 'react'
import {AiOutlinePlus, AiOutlineFilter} from 'react-icons/ai'
import Table from 'sr/helpers/ui-components/dashboardComponents/Table'
import Pagination from 'sr/helpers/ui-components/dashboardComponents/Pagination'
import DashboardWrapper from 'app/pages/dashboard/DashboardWrapper'
import {BusinessType, fetchBusinessCategory} from 'sr/utils/api/fetchBusinessCategory'
import {useDeleteBusinessCategory} from 'sr/utils/api/deleteBusinessCategory'
import {Button} from 'sr/helpers'
import Filter from 'sr/helpers/ui-components/Filter'
import {useCreateBusinessCategory} from 'sr/utils/api/createBusinessCategory'
import DynamicModal from 'sr/helpers/ui-components/DynamicPopUpModal'
import {useUpdateBusinessCategory} from 'sr/utils/api/updateBusinessCategory'
import {FieldsArray} from 'sr/constants/fields'
import {getPreSignedURL} from 'sr/utils/api/media'
import {useQuery} from '@tanstack/react-query'
import SkeletonTable from 'sr/helpers/ui-components/dashboardComponents/SkeletonTable'
import PaginationSkeleton from 'sr/helpers/ui-components/dashboardComponents/PaginationSkeleton'

interface businessTypeFilters {
  name?: string
}
interface businessTypeCreatePayload {
  type: string
  company_count: number
}
interface businessTypeUpdatePayload {
  type?: string
  company_count?: number
  id: string
}

const Custom: React.FC = () => {
  // const [loading, setLoading] = useState<Boolean>(false)
  const [filters, setFilters] = useState<businessTypeFilters>()
  const [isFilterVisible, setIsFilterVisible] = useState<boolean>(false)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false)
  const [itemsPerPage, setItemsPerPage] = useState<number>(8)
  const [selectedData, setSelectedData] = useState<BusinessType>()
  const createMutation = useCreateBusinessCategory()
  const updateMutation = useUpdateBusinessCategory()
  const deleteMutation = useDeleteBusinessCategory()

  const fields: FieldsArray = useMemo(
    () => [{type: 'text', label: 'Name', name: 'name', placeholder: 'Name', required: true}],
    []
  )

  const createFields: FieldsArray = useMemo(
    () => [
      {type: 'text', label: 'Type', name: 'type', placeholder: 'Type', required: true},
      {
        type: 'number',
        label: 'Company Count',
        name: 'company_count',
        placeholder: 'Company Count',
        required: true,
      },
    ],
    []
  )

  const updateFields: FieldsArray = useMemo(
    () => [
      {type: 'text', label: 'Type', name: 'type', placeholder: 'Type', required: true},
      {
        type: 'number',
        label: 'Company Count',
        name: 'company_count',
        placeholder: 'Company Count',
        required: true,
      },
    ],
    []
  )

  const {data, error, isLoading, isError, refetch} = useQuery({
    queryKey: ['businessCategories', {limit: itemsPerPage, page: currentPage, ...filters}],
    queryFn: async () =>
      fetchBusinessCategory({limit: itemsPerPage, page: currentPage, ...filters}),
    // placeholderData: keepPreviousData,
  })

  const handleView = async (fileUrl: string | undefined) => {
    if (!fileUrl) return
    const response: any = await getPreSignedURL({fileName: fileUrl})
    window.open(response.results.url.toString(), '_blank')
  }

  const onPageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  const onLimitChange = (newLimit: number) => {
    setItemsPerPage(newLimit)
    setCurrentPage(1)
  }

  const onDeleteBussinessCategory = async (id: string) => {
    deleteMutation.mutate(id)
  }
  const handleApplyFilter = (newFilters: businessTypeFilters) => {
    setFilters(newFilters)
    setCurrentPage(1)
    setIsFilterVisible(false) // Hide filter after applying
  }
  const handleCreateBusinessType = async (payload: businessTypeCreatePayload) => {
    setIsCreateModalOpen(false)
    createMutation.mutate(payload)
  }
  const handleEditBusinessType = async (payload: businessTypeUpdatePayload) => {
    if (!selectedData) {
      setIsUpdateModalOpen(false)
      return
    }
    setIsUpdateModalOpen(false)
    payload = {...payload, id: selectedData.id}
    updateMutation.mutate({payload})
  }

  const defaultValues: businessTypeUpdatePayload | undefined = useMemo(() => {
    if (!selectedData) return undefined
    return {
      type: selectedData.type,
      company_count: selectedData.company_count,
      id: selectedData.id,
    }
  }, [selectedData])

  return (
    <>
      <div className='container mx-auto px-4 sm:px-8'>
        <div className='py-4'>
          <div className='flex justify-between items-center flex-wrap mb-4'>
            <h2 className='text-2xl font-semibold leading-tight mb-2 sm:mb-0 sm:mr-4'>
              Business Type
            </h2>
            <div className='flex items-center'>
              <Button
                label='Create new'
                Icon={AiOutlinePlus}
                onClick={() => {
                  setIsCreateModalOpen(true)
                }}
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
            <SkeletonTable title={'Business Category'} />
          ) : (
            <Table
              handleView={handleView}
              setSelectedData={setSelectedData}
              setIsUpdateModalOpen={setIsUpdateModalOpen}
              categoriesData={data?.data}
              handleDelete={onDeleteBussinessCategory}
              topicName='Business Type'
            />
          )}
        </div>
        {isLoading || isError ? (
          <PaginationSkeleton />
        ) : (
          <Pagination
            currentPage={currentPage}
            totalPages={
              Math.ceil((data?.pagination?.total || 1) / (data?.pagination?.pageSize || 1)) || 0
            }
            onPageChange={onPageChange}
            itemsPerPage={itemsPerPage}
            name='Business'
            onLimitChange={onLimitChange}
            disabled={isLoading}
            totalResults={data?.pagination.total || 0}
          />
        )}
      </div>
      {isCreateModalOpen && (
        <DynamicModal
          label='Create Business Category'
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          fields={createFields}
          onSubmit={handleCreateBusinessType}
        />
      )}
      {isUpdateModalOpen && defaultValues && (
        <DynamicModal
          label='Update Business Category'
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          fields={updateFields}
          defaultValues={selectedData}
          onSubmit={handleEditBusinessType}
        />
      )}
    </>
  )
}
const BusinessCategory: React.FC = () => {
  return (
    <>
      <DashboardWrapper
        customComponent={Custom}
        selectedItem={'/business-category'}
      ></DashboardWrapper>
    </>
  )
}

export default BusinessCategory
