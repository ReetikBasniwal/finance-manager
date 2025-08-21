"use client";

import { createTransaction, updateTransaction } from '@/actions/transaction';
import { transactionSchema } from '@/app/lib/schema';
import CreateAccountDrawere from '@/components/create-account-drawer';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import useFetch from '@/hooks/use-fetch';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import ReceiptScanner from './receipt-scanner';
import UploadTransactions from './upload-statements';

const AddTransactionForm = ({ accounts, categories, editMode, initialData }) => {

    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams?.get('edit');

    const {
        register,
        setValue,
        handleSubmit,
        formState: { errors },
        watch,
        getValues,
        reset,
    } = useForm({
        resolver: zodResolver(transactionSchema),
        defaultValues:
            editMode && initialData 
                ? {
                    type: initialData.type,
                    amount: initialData.amount.toString(),
                    accountId: initialData.accountId,
                    category: initialData.category,
                    date: new Date(initialData.date),
                    description: initialData.description,
                    isRecurring: initialData.isRecurring,
                    ...(initialData.recurringInterval && {
                        recurringInterval: initialData.recurringInterval 
                    }),
                } 
                :
                {
                    type: 'EXPENSE',
                    amount: '',
                    accountId: accounts.find(ac => ac.isDefault)?.id,
                    date: new Date(),
                    isRecurring: false,
                }
    });
 
    const {
        loading: transactionLoading,
        fn: transactionFn,
        data: transactionResult,

    } = useFetch(editMode ? updateTransaction : createTransaction);

    const type = watch("type");
    const isRecurring = watch("isRecurring");
    const date = watch("date");

    const onSubmit = async (data) => {
        const formData = {
            ...data,
            amount: parseFloat(data.amount)
        };

        if (editMode) transactionFn(editId, formData);
        else transactionFn(formData);
    }

    useEffect(() => {   
        if(transactionResult?.success && !transactionLoading) {
            toast.success(
                editMode 
                    ? "Transaction updated successfully" 
                    : "Transaction created successfully"
            );
            reset();
            router.push(`/account/${transactionResult.data.accountId}`);
        }
    }, [transactionResult, transactionLoading, editMode])

    const filteredCategories = categories.filter(cat => cat.type === type);

    const handleScanComplete = (scannedData) => {
        if(scannedData) {
            setValue("amount", scannedData.amount.toString());
            setValue("date", new Date(scannedData.date));
            if (scannedData.category) {
                setValue("category", scannedData.category);
            }
            if (scannedData.description)  {
                setValue("description", scannedData.description);
            }
            toast.success("Receipt scanned successfully");
        }
        
    }

  return (
    <form className='space-y-6' onSubmit={handleSubmit(onSubmit)}>
        {!editMode && <div className='flex flex-col gap-4'>
            {/* AI Recipt Scanner */}
            <ReceiptScanner onScanComplete={handleScanComplete} />

            {/* Upload Statments */}
            <UploadTransactions accountId={getValues('accountId')}/>
        </div>}

        <div className='space-y-2'>
            <label className="text-sm font-medium">Type</label>
            <Select
                onValueChange={(value) => setValue("type", value)}
                defaultValue={type}
            >
                <SelectTrigger className={"w-full"}>
                    <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="EXPENSE">Expense</SelectItem>
                    <SelectItem value="INCOME">Income</SelectItem>
                </SelectContent>
            </Select>

            {errors.type && <p className='text-red-500 text-sm'>
                {errors.type.message}
            </p>}
        </div>

        <div className='grid gap-6 md:grid-cols-2'>
            <div className='space-y-2'>
                <label className="text-sm font-medium">Amount</label>
                <Input 
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register("amount")}
                />

                {errors.amount && <p className='text-red-500 text-sm'>
                    {errors.amount.message}
                </p>}
            </div>

            <div className='space-y-2'>
                <label className="text-sm font-medium">Account</label>
                <Select
                    onValueChange={(value) => setValue("accountId", value)}
                    defaultValue={getValues("accountId")}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                        {accounts.map(account => (
                            <SelectItem key={account.id} value={account.id}>
                                {account.name} (${parseFloat(account.balance).toFixed(2)})
                            </SelectItem>
                        ))}
                        <CreateAccountDrawere>
                            <Button
                                variant="ghost"
                                className='w-full select-none items-center text-sm outline-none'
                            >
                                Create Account
                            </Button>
                        </CreateAccountDrawere>
                    </SelectContent>
                </Select>

                {errors.accountId && <p className='text-red-500 text-sm'>{errors.accountId.message}</p>}
            </div>
        </div>

        <div className='space-y-2'>
            <label className="text-sm font-medium">Catergory</label>
            <Select
                onValueChange={(value) => setValue("category", value)}
                defaultValue={getValues("category")}
            >
                <SelectTrigger className={"w-full"}>
                    <SelectValue placeholder="Select catergory" />
                </SelectTrigger>
                <SelectContent>
                    {filteredCategories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                            {category.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {errors.category && <p className='text-red-500 text-sm'>{errors.category.message}</p>}
        </div>

        <div className='space-y-2'>
            <label className="text-sm font-medium">Date</label>
            <Popover>
                <PopoverTrigger asChild>
                    <Button 
                        variant={"outline"}
                        className="w-full pl-3 text-left font-normal"
                    >
                        {date ? format(date, 'PPP') : <span>Pick a date</span>}
                        <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                    </Button>
                </PopoverTrigger>
                <PopoverContent>
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(date) => {
                            if (date) {
                                setValue("date", date);
                            }
                        }}
                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>

            {errors.date && <p className='text-red-500 text-sm'>
                {errors.date.message}
            </p>}
        </div>

        <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Input 
                type="text"
                placeholder="Enter description"
                {...register("description")}
            />
            {errors.description && <p className='text-red-500 text-sm'>
                {errors.description.message}
            </p>}
        </div>

        <div className='flex items-center justify-between rounded-lg border p-3 '>
            <div className='space-y-0.5'>
                <label htmlFor="isRecurring" className='text-sm font-medium cursor-pointer'>
                    Set as Recurring
                </label>
                <p className='text-sm text-muted-foreground'>
                   Set up a recurring schedule for this transaction
                </p>
            </div>

            <Switch 
                id="isRecurring" 
                onCheckedChange={(checked) => setValue("isRecurring", checked)} 
                checked={isRecurring}
            />
            {errors.isRecurring && (
                <p className='text-sm text-red-500'>{errors.isRecurring.message}</p> 
            )}
        </div>

        {isRecurring && (
            <div className='space-y-2'>
                <label className="text-sm font-medium">Recurring Interval</label>
                <Select
                    onValueChange={(value) => setValue("recurringInterval", value)}
                    defaultValue={getValues("recurringInterval")}
                >
                    <SelectTrigger className={"w-full"}>
                        <SelectValue placeholder="Select Interval" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="DAILY">Daily</SelectItem>
                        <SelectItem value="WEEKLY">Weekly</SelectItem>
                        <SelectItem value="MONTHLY">Monthly</SelectItem>
                        <SelectItem value="YEARLY">Yearly</SelectItem>
                    </SelectContent>
                </Select>

                {errors.recurringInterval && <p className='text-red-500 text-sm'>
                    {errors.recurringInterval.message}
                </p>}
            </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
            <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => router.back()}
            >
                Cancel
            </Button>
            <Button
                type="submit"
                className="flex-1"
                disabled={transactionLoading}
            >
                {transactionLoading 
                    ? (
                        <>
                            <Loader2 className="animate-spin mr-2 h-4 w-4" />
                            <span>{editMode ? 'Updating...' : 'Creating...'}</span>
                        </>
                    ) 
                    : (editMode ? 'Update Transaction' : 'Create Transaction')
                }
            </Button>
        </div>
    </form>
  )
}

export default AddTransactionForm
