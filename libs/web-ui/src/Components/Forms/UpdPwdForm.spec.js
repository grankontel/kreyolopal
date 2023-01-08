import { render } from '@testing-library/react';
import UpdPwdForm from './UpdPwdForm';
describe('UpdPwdForm', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<UpdPwdForm />);
    expect(baseElement).toBeTruthy();
  });
});
