"use client";

import { scanReceipt } from '@/actions/transaction';
import { Button } from '@/components/ui/button';
import useFetch from '@/hooks/use-fetch';
import { Loader2, ScanText } from 'lucide-react';
import React, { useEffect, useRef } from 'react'
import { toast } from 'sonner';

const ReceiptScanner = ({ onScanComplete }) => {
    const fileInputRef = useRef(null);

    const {
      loading: scanReceiptLoading,
      fn: scanReceiptFn,
      data: scannedData,
    } = useFetch(scanReceipt)


    const handleReceiptScan = async (file) => {
      if(file.size > 5 * 1024 * 1024) {
            toast.error("File size should be less than 5MB");
            return;
      }

      await scanReceiptFn(file);
    }

    useEffect(() => {
      if (scannedData && !scanReceiptLoading) {
        onScanComplete(scannedData);
      }
    },[scanReceiptLoading, scannedData]);

  return (
    <div className='flex items-center gap-4'>
      <input 
        type="file" 
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        capture="environment"
        onChange={async (e) => {
          const file = e.target.files[0];
          if (file) handleReceiptScan(file);
        }}
      />
      <Button 
        type="button"
        className="w-full h-10 bg-gradient-to-br from-orange-500 via-pink-500 to-purple-500 
        animate-gradient hover:opacity-90 transition-opacity text-white hover:text-white"
        onClick={() => fileInputRef.current.click()}
        disabled={scanReceiptLoading}
      >
        {scanReceiptLoading ? (
          <>
            <Loader2 className="animate-spin mr-1" />
            <span>Scanning Receipt...</span>
          </>
        ) : (
          <>
            <ScanText className="mr-1" style={{ height: '26px', width: '26px' }} strokeWidth={1.5}/>
            <span>Scan Receipt with AI</span>
          </>
        )}
      </Button>
    </div>
  )
}

export default ReceiptScanner
