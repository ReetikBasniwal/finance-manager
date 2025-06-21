import { getUserAccounts } from '@/actions/dashboard'
import CreateAccountDrawere from '@/components/create-account-drawer'
import { Card, CardContent } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import React from 'react'
import AccountCard from './_components/account-card'

async function DashboardPage() {

  const accounts = await getUserAccounts();

  return (
    <div className='px-5'>
      {/* Budget Progress */}

      {/* Overview */}

      {/* Accounts Grid */}
      <div className='grid gap-4 md:grid-cold-2 lg:grid-cold-3'>
        <CreateAccountDrawere>
          <Card className={`hover:shadow-md transition-shadow cursor-pointer border-dashed`}>
            <CardContent className={'flex flex-col items-center justify-center text-muted-foreground h-full pt-5'}>
              <Plus className="h-10 w-10 mb-2" />
              <p className='text-sm font-medium'>Add New Account</p>
            </CardContent>
          </Card>
        </CreateAccountDrawere>
      </div>

      {accounts.length && 
        accounts?.map((account) => {
          return <AccountCard key={account.id} account={account} />
        }
      )}
    </div>
  )
}

export default DashboardPage