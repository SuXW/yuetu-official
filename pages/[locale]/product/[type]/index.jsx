import { useTranslation } from 'next-i18next'
import { ProductLayout } from '@/components/layout/index'
import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/router'
import { ReactSVG } from 'react-svg'
import { useMedia } from '@/utils/hooks'
import { makeStaticPaths, makeStaticProps, createParams } from '@/utils/getStatic'
import { PRODUCT_TYPE_LIST } from '@/utils/const'
import NoSSR from 'react-no-ssr';
import { ScrollView, Link, RatioBox } from '@/components';

const params = {
  type: PRODUCT_TYPE_LIST.map(item=>item.type)
}
const getStaticPaths = makeStaticPaths(createParams(params))

const getInfo = async (id) => import(`@/utils/json/product/info/${id}.json`).then(module => ({
  ...module.default,
  id
}))

const getStaticProps = makeStaticProps(['prodcut'], async(ctx)=>{
  const type = ctx?.params?.type
  let productIdList = PRODUCT_TYPE_LIST.find(item=>item.type === type)?.ids
  let productList = await Promise.allSettled(productIdList.map(id=>getInfo(id)))
  productList = productList.map(item=>{
    const { coverImgs, nameInList, subnameInList, id, category } = item.value
    return {
      id,
      coverImg: coverImgs?.[0]??'', 
      nameInList, 
      subnameInList,
      category
    }
  })
  return {
    productList,
    type
  }
})
export { getStaticPaths, getStaticProps }

export default function ProcuctsPage({ common, productList, type }) {
  const { t } = useTranslation('common')
  const router = useRouter()
  
  const [filter, setFilter] = useState('')


  const showType = useMemo(()=>{
    return PRODUCT_TYPE_LIST.find(item=>item.type === type)
  }, [type])

  const [ title, category, rawList ] = useMemo(()=>{
    return [showType.name, showType.category, showType.list]
  }, [showType])

  const options =  useMemo(()=>{
    return [
      {
        label: "不限",
        value: ''
      },
      ...category
    ]
  }, [category])

  const list = useMemo(()=>{
    if(!filter) return productList
    else return productList.filter(item=>item.category == filter)
  }, [productList, filter])

  useEffect(()=>{
    const { query } = router
    console.log(router)
    const { category:typeCategory } = query??{}
    if(typeCategory!==filter) {
      setFilter(typeCategory)
    }
  }, [router])



  const leftArrow = (
    <div className="w-8 h-full bg-[#F1F1F1] flex items-center justify-center">
      <img className="w-4 h-4" src="/svg/arrow-left.svg" alt="" />
    </div>)

  const rightArrow = (
      <div className="w-8 h-full bg-[#F1F1F1] flex items-center justify-center">
        <img className="w-4 h-4" src="/svg/arrow-right.svg" alt="" />
      </div>
  )



  return (
    <>
      <div className='py-5 bg-black/[.04] bg-transparent'>
        <div className='w-[68vw] sm:w-[420px] flex flex-row justify-between items-end m-auto'>
            { 
            PRODUCT_TYPE_LIST.map((item, idx)=>{
              const divider = (
                <div className='bg-black/[.07] w-[0.5px] h-[44px] sm:w-[1px] sm:h-[88px]'></div>
              )

              return (
                <>
                  {idx==0?null:divider}
                  <Link href={`/product/${item.type}`} replace>
                    <div className={`text-center flex flex-col items-center ${item.type===type?'':'opacity-50'}`} key={item.name}>
                      <NoSSR>
                        <ReactSVG className='w-10 h-10 sm:w-16 sm:h-16 svg' key={item} src={item.logo} />
                      </NoSSR>
                      <span className='text-xs mt-2.5 sm:mt-5 sm:text-sm'>{item.name}</span>
                    </div>
                  </Link>
                </>
              )
            })
            }
        </div>
      </div>
      <div className='bg-white py-6 px-4 sm:pt-8 sm:pb-12 sm:px-0'>
        <p className='text-black/90 font-medium text-lg pb-4 border-b border-black/[.07] sm:text-base'>
          {title}
          <span className='mr-2 ml-3 text-black/[.35] text-xs'>筛选产品</span>
          <span className='text-xs'>{list.length}件</span>
        </p>
        <div className='w-full mt-6 sm:flex sm:flex-row sm:items-center'>
          <p className='mb-4 text-black/[.55] text-sm sm:text-xs sm:m-0 sm:flex-shrink-0 sm:mr-5'>产品类型：</p>
          <div className='-mx-4 text-sm sm:text-xs sm:flex-1 overflow-x-scroll'>
            <ScrollView rightArrow={rightArrow} leftArrow={leftArrow}>
              <div className='px-4 h-[38px] flex items-center'>
                {
                  options.map(item=>(
                    <div key={item.value} className='inline-flex items-center mr-6 ml-1' onClick={()=>setFilter(item.value)}>
                      <span className={`${item.value==filter?'border-[6px] border-primary sm:border-[4px]':'border-[2px] sm:border-[1px] border-black/[.15]'} w-5 h-5 box-border rounded-full inline-block sm:w-[14px] sm:h-[14px]`}></span>
                      <span className='ml-3'>{item.label}</span>
                    </div>
                  ))
                }
              </div>
            </ScrollView>
          </div>
        </div>
        <div className='w-full grid grid-cols-[repeat(2,44%)] mt-10 text-center justify-around sm:grid-cols-[repeat(3,28%)] sm:justify-evenly'>
          {
            list.map(item=>(
              <Link href={`/product/${type}/${item.id}`} key={item.id} className='mb-8 sm:mb-10'>
                <RatioBox width={100} height={100} className={`bg-center bg-no-repeat bg-cover`} style={{backgroundImage: `url('${item.coverImg}')`}} />
                <p className='text-base mt-5 mb-3 text-black/90 font-medium'>{item.nameInList}</p>
                <p className='text-xs text-black/[.55]'>{item.subnameInList}</p>
              </Link>
            ))
          }
        </div>
      </div>
    </>
  )
}

ProcuctsPage.getLayout = page => (
  <ProductLayout>
    {page}
  </ProductLayout>
)