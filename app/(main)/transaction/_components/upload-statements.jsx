"use client";
import { scanBulkTransactions } from '@/actions/transaction';
import useFetch from '@/hooks/use-fetch';
import { Loader2 } from 'lucide-react';
import React, { useRef } from 'react'

const UploadTransactions = ({ accountId }) => {
    const fileInputRef = useRef(null);


    const {
        loading: createTransactionsLoading,
        fn: scanFileFn,
        data: scannedData,
      } = useFetch(scanBulkTransactions)

    const handleUploadFile = async (file) => {
        if(file.size > 5 * 1024 * 1024) {
              toast.error("File size should be less than 5MB");
              return;
        }
  
        await scanFileFn(file, accountId);
    }

  return (
    <div className={`border-2 border-dashed border-gray-300 rounded-lg p-2 text-center ${createTransactionsLoading ? '' : 'cursor-pointer'} hover:border-gray-400 transition-colors`}>
        <input 
            type="file" 
            ref={fileInputRef}
            className="hidden"
            accept=".pdf,application/pdf"
            capture="environment"
            onChange={async (e) => {
                const file = e.target.files[0];
                if (file) handleUploadFile(file);
            }}
        />
        <div 
            type="button"
            className='flex flex-col items-center space-y-2'
            onClick={() => fileInputRef.current.click()}
            disabled={createTransactionsLoading}
        >
            {createTransactionsLoading ? (
                <>
                    <Loader2 className="animate-spin mr-1" />
                    <span>Scanning file...</span>
                </>
                ) : (
                <>
                     <svg 
                        className="w-8 h-8 text-gray-400" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                        />
                    </svg>
                    <div className='flex flex-col'>
                        <span className='text-md font-medium text-gray-900'>Upload Statements</span>
                        <span className='text-xs text-gray-500'>and generate transactions</span>
                    </div>
                </>
            )}
        </div>
    </div>
  )
}

export default UploadTransactions