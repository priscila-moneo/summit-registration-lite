import React from 'react';
import { cleanup, fireEvent, render as render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import PersonalInfoComponent from "..";

jest.mock('openstack-uicore-foundation/lib/components', () => ({
    RegistrationCompanyInput: ({ onChange, value }) => (
        <input
            data-testid="company"
            value={value?.name || ''}
            onChange={e => onChange({ target: { value: { name: e.target.value } } })}
        />
    )
}));

const mockProfile = {
    given_name: 'Test Name',
    family_name: 'Test Last Name',
    email: 'test@email.com',
    company: { id: null, name: 'Test Company' },
}

const mockFormValues = {
    ticketType: null,
    ticketQuantity: 1,
    personalInformation: null,
    paymentInformation: null,
}

const mockHandleCompanyError = jest.fn();

// Note: running cleanup fterEach is done automatically for you in @testing-library/react@9.0.0 or higher
// unmount and cleanup DOM after the test is finished.
afterEach(cleanup);

it('PersonalInfoComponent set the initial values from the user profile', () => {
    const { getByTestId } = render(<PersonalInfoComponent formValues={mockFormValues} userProfile={mockProfile} handleCompanyError={mockHandleCompanyError} />);

    const firstName = getByTestId('first-name');
    const lastName = getByTestId('last-name');
    const email = getByTestId('email');
    const company = getByTestId('company');
    expect(firstName.value).toBe(mockProfile.given_name);
    expect(lastName.value).toBe(mockProfile.family_name);
    expect(email.value).toBe(mockProfile.email);
    expect(company.value).toBe(mockProfile.company.name);

});

it('PersonalInfoComponent shows the personal data when is not active', async () => {
    const { getByTestId } = render(<PersonalInfoComponent isActive={false} formValues={mockFormValues} userProfile={mockProfile} handleCompanyError={mockHandleCompanyError} />);

    const personalInfo = getByTestId('personal-info');
    expect(personalInfo).toBeTruthy();
    expect(personalInfo.firstElementChild.innerHTML).toBe(`${mockProfile.given_name} ${mockProfile.family_name} ${mockProfile.company && mockProfile.company.name ? `- ${mockProfile.company.name}` : ''}`);
    expect(personalInfo.lastChild.innerHTML).toBe(mockProfile.email);

});

it('PersonalInfoComponent checks the validation of each field', async () => {
    const { getByTestId } = render(<PersonalInfoComponent formValues={mockFormValues} userProfile={mockProfile} handleCompanyError={mockHandleCompanyError} />);

    const form = getByTestId('personal-form');
    const firstName = getByTestId('first-name');
    fireEvent.change(firstName, { target: { value: '' } });
    const lastName = getByTestId('last-name');
    fireEvent.change(lastName, { target: { value: '' } });
    const email = getByTestId('email');
    fireEvent.change(email, { target: { value: '' } });
    const company = getByTestId('company');
    fireEvent.change(company, { target: { value: '' } });
    fireEvent.submit(form);

    await waitFor(() => {
        const firstNameError = getByTestId('first-name-error');
        const lastNameError = getByTestId('last-name-error');
        const emailErrorRequired = getByTestId('email-error-required');        
        expect(firstNameError).toBeTruthy();
        expect(lastNameError).toBeTruthy();
        expect(emailErrorRequired).toBeTruthy();
    });

    fireEvent.change(email, { target: { value: 'no email' } });
    fireEvent.submit(form);

    await waitFor(() => {        
        const emailErrorInvalid = getByTestId('email-error-invalid');                
        expect(emailErrorInvalid).toBeTruthy();        
    });
});

it('PersonalInfoComponent checks that company input field is hidden when `showCompanyInput` is `false`', async () => {
    const { getByTestId, queryByTestId } = render(<PersonalInfoComponent userProfile={mockProfile} formValues={mockFormValues} showCompanyInput={false} handleCompanyError={mockHandleCompanyError} />);

    const form = getByTestId('personal-form');
    const firstName = getByTestId('first-name');
    fireEvent.change(firstName, { target: { value: '' } });
    const lastName = getByTestId('last-name');
    fireEvent.change(lastName, { target: { value: '' } });
    const email = getByTestId('email');
    fireEvent.change(email, { target: { value: '' } });
    const company = queryByTestId('company');
    expect(company).toBeNull();
    fireEvent.submit(form);

    await waitFor(() => {
        const firstNameError = getByTestId('first-name-error');
        const lastNameError = getByTestId('last-name-error');
        const emailErrorRequired = getByTestId('email-error-required');        
        const companyError = queryByTestId('company-error');
        expect(firstNameError).toBeTruthy();
        expect(lastNameError).toBeTruthy();
        expect(emailErrorRequired).toBeTruthy();        
        expect(companyError).toBeNull();
    });
});

it('does not crash and shows error if company field is cleared and form is submitted', async () => {
    const { getByTestId } = render(<PersonalInfoComponent formValues={mockFormValues} userProfile={mockProfile} handleCompanyError={mockHandleCompanyError} />);
    const company = getByTestId('company');
    const form = getByTestId('personal-form');
    fireEvent.change(company, { target: { value: null } });
    fireEvent.submit(form);
    await waitFor(() => {
        const companyError = getByTestId('company-error');
        expect(companyError).toBeTruthy();
    });
});

// it('PersonalInfoComponent set the fields if there is a reservation', async () => {

//     const { getByTestId } = render(<PersonalInfoComponent isActive={true} userProfile={mockProfile} reservation={mockReservation} />);

//     //await waitFor(() => expect(mockSetPersonalData).toBeCalled(), { interval: 100 });

//     await waitFor(() => {
//         const firstName = getByTestId('first-name');
//         const lastName = getByTestId('last-name');
//         const email = getByTestId('email');
//         const company = getByTestId('company');
//         expect(firstName.value).toBe(mockReservation.owner_first_name);
//     }, { interval: 500 })

// });

// it('PersonalInfoComponent restore the values from the reservation', () => {
//     const { getByTestId } = render(<PersonalInfoComponent ticketTypes={mockTicketTypes} onTicketSelect={mockCallBack} />);

//     const firstName = getByTestId('first-name');
//     const firstNameError = getByTestId('first-name-error');
//     const lastName = getByTestId('last-name');
//     const lastNameError = getByTestId('last-name-error');
//     const email = getByTestId('email');
//     const emailErrorRequired = getByTestId('email-error-required');
//     const emailErrorInvalid = getByTestId('email-error-invalid');
//     const company = getByTestId('company');
//     const companyError = getByTestId('company-error');

// });

// isActive, changeForm, reservation, userProfile


// reservation