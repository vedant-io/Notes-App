
import { useState } from 'react'
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa'

const PasswordInput = ({value, onChange, placeholder}) => {
  
  const [isshowPassword, setIsShowPassword] = useState(false)
  
  const togglePassword = () => {
    setIsShowPassword(!isshowPassword)
  }
    return (
    <div className='flex items-center bg-transparent border-[1.5px] px-5 rounded mb-3'>
        <input 
          type={isshowPassword ? 'text' : 'password'} 
          value={value}
          onChange={onChange}
          placeholder={placeholder || 'Password'} 
          className='w-full text-sm bg-transparent py-3 mr-3 rounded outline-none'
        />

        {isshowPassword ? <FaRegEye
          size={22}
          className='text-blue-500 cursor-pointer'
          onClick={()=>togglePassword()}
          /> : <FaRegEyeSlash
          size={22}
          className='text-blue-500 cursor-pointer'
          onClick={()=>togglePassword()}
            />}
        
        
    </div>
  )
}

export default PasswordInput