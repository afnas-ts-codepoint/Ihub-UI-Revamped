import type { ComponentPropsWithoutRef } from 'react';

export function Table(props: ComponentPropsWithoutRef<'table'>) {
  return <table className="w-full border-collapse text-base" {...props} />;
}

export function THead(props: ComponentPropsWithoutRef<'thead'>) {
  return <thead {...props} />;
}

export function TBody(props: ComponentPropsWithoutRef<'tbody'>) {
  return <tbody {...props} />;
}

export function Tr(props: ComponentPropsWithoutRef<'tr'>) {
  return <tr {...props} />;
}

export function Th(props: ComponentPropsWithoutRef<'th'>) {
  return <th {...props} />;
}

export function Td(props: ComponentPropsWithoutRef<'td'>) {
  return <td {...props} />;
}
