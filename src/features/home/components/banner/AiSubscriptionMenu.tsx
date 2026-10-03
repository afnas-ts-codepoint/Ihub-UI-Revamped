import { useTranslation } from 'react-i18next';

import { Icon } from '@/shared/ui/icon/Icon';
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from '@/shared/ui/overlay/DropdownMenu';

import { actionButtonClass } from '../actions/actionButtonStyles';

const providers = [
  { label: 'Claude', url: 'https://claude.ai' },
  { label: 'ChatGPT', url: 'https://chatgpt.com' },
  { label: 'Gemini', url: 'https://gemini.google.com' },
] as const;

/** @prototype index.html:L5819-L5853. */
export function AiSubscriptionMenu() {
  const { t } = useTranslation('home');

  return (
    <DropdownMenuRoot>
      <DropdownMenuTrigger asChild>
        <button
          className={`group ${actionButtonClass('ghost')}`}
          type="button"
        >
          {t('actions.aiSubscription')}
          <Icon
            className="transition-transform duration-150 group-data-[state=open]:rotate-180"
            name="chevron-down"
            size={14}
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[200px]">
        {providers.map((provider) => (
          <DropdownMenuItem asChild key={provider.label}>
            <a
              className="justify-between px-3 py-[9px] text-base-plus font-medium"
              href={provider.url}
              rel="noopener noreferrer"
              target="_blank"
            >
              {provider.label}
              <Icon className="text-fg-4" name="arrow-up-right" size={14} />
            </a>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenuRoot>
  );
}
