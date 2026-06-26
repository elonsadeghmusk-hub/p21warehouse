/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';

const LOGO_URI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAL0AAAByCAYAAAAGadBRAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAACgOSURBVHhe7Z13fFRV+oefc+/0SSaFFCD03rGAuKBiBftiXRXUdXEtu8rPtbvFteDKqrvWde2FYhe7gIq4IghKk15CSyOFZJJMn7n3nt8fMwlkACUwSYYkz8d8MPc9d3KT+73nvud933OOkFJK2mmnDaHEH2inndZOu+jbaXOIdvfmyEFGIhjhMFLXkboOhox+CQkSJAKhKrEvE8KkIsxmhKrGf1Sbpl30LYTh86N5PeheH+GSXYRKS9Eqq9C8XnSvF93jwwj4MfxBNJ8H6fcS8YcwgkFkKIgMhSBsIA0daeggwVAUFEUiTBaEoiBsFhSrHZPThuJwIuwOVIcN1e5AdaagpjpRnA4sHTpgyc3FnJODmpqC6nCgOOwoVhuK1YIwmeIv/4imXfRNiOauJlRURLi0jHBZGYEdOwlu2UqwrAyj1ovh8xD2eLEDFiFQhUABVKL/rwIC0ABNSiJSEpYGPgGW1FSE3YFit6FaLSgWG8KkgqoihUAoov46hAFIiSH16Pd1t7zuzqsCYXdiSnGipqZgSk/HlJ6OOSMDe5/eOIcORrFY6j/vSKdd9AlADwaJlJYR3LYd70+rCRUUEiwsJFBQiFGxG6sQmIWCAHQkelSDAJhEVORCQFhKfEJgzcpCzeqAo1dPbD17YMnJrhehmuZCdbkwpaSgOh2IViTG5qJd9IdAuKwM/8ZN+DZsxLdqNb7164iUV2INR7AIgYyJOyIlmgQZ61JNQkR7dASalAQUibVnL5z9++Lo3Rv7oIHY+/bBnNUBk8sV/2PbSRDtoj8IIhUV+NdvpHbRYjyr1uDftAmTx1sv8IiUaEh0WSfvKCoCqyIwI4ggCaem4OjTm5RjjyblmGOw9+6FrUf3VuczJzvtot8fUuJZuw7P4iXULvoe35qfUGu8WIWChiQsJVqcwOswC4E15pv7hMA2aABpI0eSevxxpAwbgjk3N/6UdpqZdtHHkJqOZ9UqauYvoPqbRfg3rselqOhIQj8jcmJui10IBAK/1YJrxLGknjqW9F8dj71/v/jmzYKUEgEg9gxo24nS5kXv37AR99wvqJr3JaFNm3GqKhEpCRkS/YAyj2b1bIqCCYHPaiHt+FFknnEarrEnYOncOb55o5CahhEMoXs8aLU1RCqr0KrcaNXVaB4Pht+P5gtg+LzoXh+GL4ARDmIEQhhaBCI6BgYKEgOBoqpIk4rJakGxOVAd9mjIMsUZHRg7nZjS0zBnZWHOzcHSoQOmzAwUqzX+0loFbVL0mrsa9/yvcX/4EbVLfiAFQUhKQoaBEd84DrMQOIRCQBpYBw8i87yzyTjjdGw9e8Q3PTBSYgSDRKrcRNzVGJ5awqVlBIqK0XbtIry7Eq3Gg+auIlzpRqtxY9YN7IqCRQjMscGwiEUd68YVESS6jA6i976pdX29aPAVPVr3GUYsqhQyDHCmYsrOxJKZgb1LZ6y9euMY0B9b165Yu+ahpqbu9elHHm1K9P5Nm6l8/wMqP/4Yc0UVEgjI6AD0l7ALBbMQhFKdZIwfR+aE83Edf9whuQ8yHCFSWYlWUxONXSpK/ecoFjPCZAZFgFAQQkQfknAYw+8nUluLXl1DpKoSvaaWUMVuwiW7iBQW4S8uQqvxkCoEJkR9BCki5S8+zHs/GNEcgUARYIo9HmEp8SOxZGXiHDCQlKGDcQwdQsrwYVg6dYz7tOSmTYi+9vsllM+YRdW8+bgEBAyD0EH82gKwKwoqILt1I/M3F9Ph/HOwHqb70lREKioJVZQTLizCt+onPGvXEcjfhigrwy4UdCTB2PiksQhAQaCKWCItFnb12+2kDupH2pjRuE44AeewoSgWc/zpSUXrFb2UuL/4iooZb+Bb/D1WoeCXxkHdcAE4lGgtnjJoILlXTiTzvLNR7Pb4pkmP7vPjX7sOz/IVVH+3CO9Pq3AGI416yx0IsVfuwYQgIA3MvXuRfspY0sefQeqxx8SfkhS0OtEbmkb1Z3MoeeU1jDXrUQX4DsJXr8OuKJgAdcggcn4/mYwzx7WqOHqosIiahd9RPfdL3IsW40IQlAf35vslFMAqFKyKwKsb2IYNJvfSi0k/+0zMGRnxzVuMViN6Ixyh6uNPKHt9JqzfiIHEbxg/E39piEWIqAvQqwe5N/yerAnnt/rqRP/GTbg/+ZyK997DsttNWEqC8mC7h59Hqe9ABOGcLLIuuYjsSVdgycmOb9rsHPGil1JS9dEnlL34CnLjJgxolNgVBKmqQjDVQcfrryf36klHpBtzOGg1NVS8+z4V02dgLinDbxiE6+L8CcAa61BC6RlkX3sVuddcjWqzxTdrNo5o0Vd/9TUlzzyHXLMGnegAtTG/jENRMCSkXXA+nW65GVvXLvFN2hRaTQ3lr8+i/MVXsfh9eIyfy1Q0njrx63170/meO8gYe1J8k2bhiBS9Z/kqyp99Dt+Cb1CEwNdIsatCkCoUtF49yLv7DjJOOyW+SZsmsG07xf94hPCC/xGQie31AZyKgiYlWb+fTN7tt6CYmzfac0SJPlxWRvHTz+J+6x1sUuA19IMeoBJLwjiEAkjSr5xI3m23YHId2YmWeIpKq5k9fwOqIrh0/FCyM53xTQ6a0pdfpXjaY5gMA79hJFT4qhC4FAV5/Ch6Pf4YluwO8U2ajCNG9OVvvEXJU09j2+3Gaxxc6DEel6ISzs6g231/J/PMcfHmI54lqwuYdOe77KwIgmpl4hndee2hS+KbNYqaRd+z/ebbMdVU4Umw8AHSVZVw7170f/VFrJ07xZubhKQXvX9LPoUPPIy2eDERySFFFxTApaoox4+k27SHsHVpfb7710vyueTWt6kNamBomITgvSeu4JyxA+KbNhr/ps1sueZ61LLSJhF+mqqi9+lF/zdmYM5s+tBmUq+GUD59Fpsv+A364u/xGkajBS9jyROnomK94jf0ee3lVin4Txas54Ips6gNREAPg2LmyXvOSYjgARz9+9HntRcw0jNxCKVR46eDoUbXMedvI/+W2/dMKWtCklL0kcoqtv7xFnbfPxXp91FzCFEECdiEwARk3n0rPR/4O0orSjLVMeOjFVx621v4IwYYYTDZuXXSSK67dFR808PC2a8v3Z99HEOJZmATTbWuoyz+npIXXo43JZykc29qli2n8I57MBUWUaM3XuzsJXgUha6PTSNrwvnxTVoFT89axK2PfRH9jQ0NTA4uPrUXbz56RXzThFH8wkvU/PPf1BrRSeaJxCoEht3KkHmfYW3CN3JS9fTlsz9k25WToaAQ92ELXqXr04+3WsH/86VvuPVfX4I0wIiAamf0kBxenXp4A9dfIu+6a9GOGkqKkvhsdUhKUkIRdr38arwpoSSN6Iv/+zylt98DoeBhDZYsQmAIQdcnHyPrrPHx5lbB3576gr8++220d5caqDZ65zl559+XY7M2fcy7x913EIplsxON3zCo+OgTdL8/3pQwkkL0BdMepeaxJwnHSl8P9U8ZLXgSdL7/XrLOOSve3Cq49ZHPmPb6D1H/XeqgWEixq7z96GXkdmienINr5Ahso0bijFWiJpKwlFhrPPjWro83JYzEX3Uj2Tl1Gv4XX8UXi70fquCJxeFTrrmKTpMujze1Cq6/fzZPv7UC9EDUrREmkJJX7p/A8AHNW+Pf6apJ6Bze/dofEjAj8CxbFm9KGC0q+sLHnyLw6nRqDf1n56P+EhJwKQrGiGPofs+d8eYjHk03mHjn27zy8XrQg7GwngDFzL9uH88Fpw+JP6XJcf1qFAGXE3MTRHIMJKGCwvjDCaPFRF/25jvUPPNfvPLga90PhFUIAnYnvR6b1urKgf3BMBfdMpN35m8BLRB7xAGTnRsuGs6USWPiT2kWTGku0kaOwioSLyEJrc+nr/l+KcV/u79+/ZjDxSYUOt8xpdVVSdZ4Aky4aQafLy4Azb+X4B2cPjKPJ+45L/6UZiVlyKCEuzd1CHPTLVfY7KKP7N7N9j/dgSlBs3WcioLWrx+dJk2MNx3RlFd5Ofem11mwcldM8DFUGwO7pTJz2m9Qm2Ag2RisnToehlN6YBQEltyc+MMJo9n/atv+dj/23bsTUrUniHZ+XW75I7Qit2ZHcRXjrnuFJWsrGgpeMZNmF7z92OV0SHfsfUqLoDhT9iwqlWCcQwbHH0oYzSr6yo8/RftiPjV6YrJ5dkVB69ebjDNOizcdsWzcXs74619h3baamA8fQ6gIJNMfvoSBvZuuF2wMMm59nUSgArVIUoY23eC82USve30UPPwYGr+8BsvBYkKQc9EERAu/5hPF6k27OOuGV9lW4o+GJesRoFiYdss4zj4pMUVkicCo9aDEFrFNFFZFwda3D5a8pgvBNptaSmfMxF5eTsBIjORVIfAIyBx7crzpiOT7VTs5+8bXKaoIRsOSe2Oyc/W5A7n16hMaHm9hwqVlCXdtLEKQM+H8Ju3Imu6T90KrraX09ekEEzBwrcMiBNY+vbH16RVvOuKY990mzvnDDMrcQdBDDY2qnZEDOvDMXyY0PJ4E+NasTWgvbxECr9NJ1gVNWy/VLKKv+moB9gp3o+vhfw4zAueggU3aIzSGu/89h4v+9DbzvttMYwpXZ3+5lov+9BaeQCRaWrA3ioVOGRbeeuxybNbkKovWqty4l/yQ0HvqUBSyL7sUSxMvZ94sitn9wYdNMOQhKdZQqSOiGXy8qJBzb57F6InP89+3l1BW6Y1v1oDpHy3nsjvfIaTFKiX3RqioSF7/x8V065Te0JYEVC/8DmcwkJA8C7HKWH9aBnnXXxtvSjhNLnrNXU3tytUJdW3qUJNofZr7/ng6XTN0QLBsYylT/vkFx1zyNHf+aw5rNpfGN+e5t5cw+b6Pol1BvOBjA9dHbx/HKaN6x9mSg7JZbyD2pMsOCwFYhEKXe27D1BqmC/rXb8Dq9yWsR2iAnrhX6+GS6rTywE3jQCjRKXt6kPKqAI+/sZzjr3iGy+54i6+XbkXTDB5+cQE3T/siWkNjaPEfBSY7k84awM0TW6bE4JeoXbKU0PJV+BMQlJCxObLKqWPJufjCeHOT0OSi965bi60J5lUSW5wombjinKMYObADqLHVu6QGmp+wBu/P38z4615hxCVPc+9/5oOMlQbHo9oY0jOV//zt1/GWpKHgX09ggcMOPUsgRVEIZWfT+x8PxJubjCYXvVbtiT+UECSSYGFB/OEWRVEED005Ewy94br10oiGIQWs21EV7eH3NwBUTKTYJDOnXYbD1nS1J4dD2dvvIlb8hC8BvbxVCDRFoecTj2HObr7xWZOLXu7v5iaAkJTU/rQO3dM0D9Whcsqo3lxwWr89vf3eSBnz3/f33hMgTDx+5zkM7tO00YtDJVhUTMm0RwjLxq0otz9MIrrrYueH7sc1amS8uUlpctGrTkfCExjEtpuxuKvw/rQm3tTiPDTlTByqBqIR9UAmO787fwi/nTAi3pIUSMNg6x13Y631HXZQwhTbwijzzlvJvfTieHOT0+SiTxk8+LCmAB4IGRvx7/7ks3hTi9O3ewdumjga1IPcqEy1MrBbKo/f3bKlwj/HzgcfRv1hObWGflj3Mip4QeqUP5B3w+/jzc1C04v+qOEE7PYmmWETkAZVn80jUlYRb2pxbvvtiXRMV0D5hYnaQsWM5OUHL8Zh+4W2LcSuV17HO30mtYfhx0c7KYEVQdrtt9D1/26Kb9JsNLnoTRnpZI45HlsTzLCJSElqwE/R8y/Gm1qczDQHf7nu1Og81p9DsXLXtWMYOSQv3pIUlL/zPuVTHyYkJYfqycvYwrmKopI99e/k3Xh9fJNmJfFK3A8dr56EJo0m+WFeaVA540286zfEm1qcyReNZFjvtAO7OaqNk4/O5d4bz4i3JAXl782m6J6/osdWKThU0hQVmZ5O9xeeoeMVl8Wbm52m0OE+pI0ZjenEMbgU9RD7igMTkRKbobH9nr9ihOMzmy2L2aTy6O1ng2FEk1Z7o5hIsRo8e+8Fh7IrZ5NT+vp0Su78M8jojumHcokqggxVRQwfSr93Z5JxanLsA9Asogfoee9f8Nks2BN8hwXgNQzMazew4977480tzqmj+nD5WYPiQpgChJmpU8bRt3vWXseTg8JH/03FAw9HN1M+RME7FAWLAPuVE+n/5nQcvZOnnKLZRG/v3YtuU+/HJASmBAsfoNbQCb47m8LHn443tTjTbjmLDKcEJebfq1ZOPCqXP14+Or5pi6J5PGydcive514iGNt0ubF3ShWCdFVFyetIt+eeptvf/4JiPYB710Ko9913333xB5sK58ABBIWApcvQE5DG3hsJaIDx4zJCuk7ar46Pb9JipKZYSXFYmLO4EBCoUue9JybSMat5ViQ7GDxr1rLjhpsxliyltpE7vNSREivzTrnkQno+8Tgpw5puyt/h0CKrFhc+9QzVT/4HTR7eMn77Q0WQoijYLpxAtwfvbdFd7PZG1w0u+dNM5v1Qwr2/P567JifPjK+yGbMonvYolmAI7yGEJa1CYFMUjIEDyLvtT6SffGJ8k6SiRURPrIaj9IGHMAVDeA7hD/1zKLGdR+SwIXSdej8pgwbGN2kRwhGNrYVuBvZqvjqTnyNYUEjRQw8T+uobQrElWRrTAZmEIEUoBNLS6HjDZHKuvhI1yVyZ/dFiogfwrFpN4b33oazbiE8aRBJ8KamKQsBqpfOUP9Dxmt+iWJOziKslKJsxi5LHn8RW66W2kcuiqzGxexUTHSdeSu7112Lp1DG+WdLSoqIHMEJhdj37PGUvvYwjFMZjGOgJuqS6LKBDKMiB/el08x/IGJ+cMfHmwrN8BcWPPY7+w7LYDuEH37srQIqi4sMg45yz6XzDdTgGJc/qDAdLi4u+jkD+VnY9+zzujz/FIcGf4J7fqURr+s3HHkPuVZPIGH86opn3L21JQkVF7Hr2eSrefg9HLMx7sH9dFYFTUQgYBhlnjiPn2mtIOfbo+GZHDEkj+jq8a9dRMX0W7s/m4AiGCCEJGYe/yCuxmL5TUZASlH79yLzgPDLGnY6tZ4/4pq2GcFkZ5TPfoHLmG1hrfXjkwb9JVRENCnh1ncwzx5E9+RpcI46Jb3bEkXSiryNYUIj7k8+o+PhTtC352IVCWEpCCVjlWAA2RcGMwG8x4zphNOmnjCVt7IlY85KzBqaxRCoqqHjzbSpmvom1yo3fiO78fTCYYy6hB0nWeWeTfeUkUo/gnj2epBV9HTKi4V2xkspPP6dm6Y9o+fk4hIKOrF/1+HAeApMQ2EV0IxmfzYyjb39cY0/AdfRR2Pr1wdq56VbaagoC27ZR+d4HVL0zG0u1m4Bx8AvlWoXArij4rXYyf30uuVdPxN6/X3yzI56kF/3eSE3Du/InvCtWUvvdYvzrN2JUVeFQoy6LFnsQDBldcKSxv5hJCKxCoCKISEnEbsHWbwCOvr2w9eiOY9AgbN27YUpPR01NQSRqi04pG04vPAQ8S3+k4p33qJw7l9RQ5KB7diVWMiAQRHKyybn0IjIvugBbt67xTVsNR5To49Gq3ATyt+JZtpzA5i34t20jlL8NJRjEEhOvBHQkuozucGHUzdqLPRIH+uVFzKetewgEEJIGAUVBTUvH4krBlJODtUsettxclNQUFLsN1WZHsZihfhEqGf3PMEBREKqCMJkwZXbAnJmBKc2FKS0N5RCSaOGyMmq+/obd732Af+UqHELBJ6PbGP0cIhbVsikKft0gZdQIMiecT8bZZ2JyueKbtzqOaNHvj/CuUsJFRQRLdhEuKsa3aRPhkl1olVWEa70Q9KH7g1iFwCxEo3bIEyK6qq6CQBXRqIaAWGGWQcAw8AOq3YHJlYolzYUpOxtbz+5YunTG0iEbc4dMzDlZWHJyUF0uFFVt1DLjus+P58cfqfzwE9zffouzxouGJPALg30R89VtQkFDInM7kn7GKWSedw6pI46Nb96qaXWiPxBGOIzh96P7A+jV1YQrK9Hd1Wi1teh+P0YgiBEMIcNhpKZh6HrsPQESEeuhzShWK6rNirBaUB0OhNOJOS0Nc3o6poyY22OxoNjtKJbEJMOMQADPj8up+eZ/VH/1FUbRLixCISh/3oWp69GtsTFQKC2VzJNOIv2M00gbeyJqSkr8KW2CNiP6I41QcQm+n1ZTM38B1T8uRxQVYRVKfbnA/m7a3i6ZGUFQGsjcjqSOPJrM8eNIPW5Esy61kay0iz5J0NzV+NasxbNsBbXLluFftRprMIQqBCEp97vshogNvi1CYEIQQRKyWXAOGIhr1HG4jj8O59FHoaa2zR79QLSLvgUwwmFChUUE87fiWbUK78o1BLfko7ir9rgisXBs3c1RACUm7uhYJDqFT3OlYO3VE+fgwbhGHUfq8KFYWtmGc4mmXfRNiBEOo9fWEirZRTB/K4H8bfjz8/Fu3kK4sAinjA4u9845sJe4TSI6aAYISgPNYsHWpRP2AQNxDBqAc2D036Ze2rq10TpFLyVGMIgMhzE0Pba7tog5BFGEENFvhdhvjFxKogNZQyJ1IxpyNDRkRIsOisNhjEAAIxjCCAbRPR4iuysJl5YRKi0lUl5BpKKCkLsKpcaDU1FQYz9Hj+UURCwSFD0q6ydgazYLltyOWDt3wt6tK/b+/bD364uta1csHTsizAnKD7RRWqXopWEQLi4mWFgUdSMKCwkX7yJcVobmdqMHQ2gBHzIUQoZCEJEYho4QUSFKGXsQYokuJVaJuMfFiA4YTXuFLtWYyxHdgymaF6jLD0RiPnlISoTVirRZsNhTMGVnRsWd1wlL506Yc3Kw5XXGkpeHOatDwqI/7TSkVYp+f0hdR/f5MPwB9GAAzeNFen1oXg96dQ0Rtxut1ovuqUX3+SCsYWgRpKaBYSA1AykNhJCAQAoQigoimnBSzCaEyYwwmxFWK6YUJ0qKE0tGBmp6ejSL60rFlJqK4nSgOhyoTmf8ZbbTDLQZ0bfTTh3NthpCW6HWG7dRWhtGAoaRfH1qu+gThLvaz+zP1+P1tYsewOsLsXR5QaM2nWsujkjRSykpLKlGT5Ltdxb9uJPX3lnOkH7ZdM5t/QVbv8Rut59X3lpG544uVDX5JJZ8V3QQGBK+/DafUHg/29c0IxWVPv7z6ves21zGNZeNpF+f9hT/jkI3T720kLHH96JbXvLtikiyDmTd1QFSnBbM5n2rD8sqPNhtZlyp+5biSglrNpbSp3smFosJk2nPM13p9lNQ7OboBK0OPOfrTSxduZPTT+rHCSNb73TDxrDox5188uU6rr18JH16Jm8HkHSi1zSDb5dsZ+zoXqjKnqRRrSfIp19tonhXDccOz+PUMXvWRtQ0A5NJYUehm1ffXs6ZJ/ejZ7cMOubsWUGsuiZAJKKTnXV4dSglZbXM/nwtqSlWLjx7CKnO5F/npTl499PVrNtUxs2/G0OHDEe8OalIOtFLKfH4QrhSbNR6g6Q4rCiK4Mtvt7Bi7S5OPr4nhmHQq3smC5fu4JQxvZFSEgppzPtmC7+7fATvfbaG007oQyAYwV0ToKYmyLHD87Ba9p/JlMBz05fEHpbMeHM9um7w+fyN9O2VxYA+OfHmNkkorDFz9ip03eDay0ei7NVRJStJ59MLIWKCD1HrCdX/EdNcNu76w0n07dmBp15dzP3/nk/P7hmUVXjJynRisZjYVVYLQEmph4efWsAHc9exZXsl/XpnH1DwALsrfTz92hJqPAeOvEgJb3y4ilHHdGsXfIyIZjD787V07eTiuonHoSiCbQVVLFyyPb5pUpF0PX0d2wuqmPn+Co4/tifbdu5mzMgeDBkQLaxa9ONOrDYTI4bm8fDT39CjaxbBUIijB3fiqCGdKS33sLPIzXFHd9tfWc0+lO/28tP6XdTUhjjtxN5kpO27E7lhSK7445v06t6Bf9w9Pt7cJvEHItR4gnTay418+MkF/LimiNkvXdmgbTKRdD19Hd26pJOR7uTLb7fSv3d2veABxozszoih0QHpWaf2Y+XaUhx2M8MGdQKgY04qo445OMED3Pevr3h2+jL++sg8dhZVx5uB2B6xd5+J1bLv4LotEonoFBS5Gwi+pjaI2arSp0cHnn39+wbtk4mk7embCynhxVlLyMxIoUsnF8cMzcOyn6jR4mU72VHoZsTQzvRrZvdmV7mHjDQ7NuuBXbTmZvWGElatL+Oqi/ashzP/u3zunjqH/v07MbRfNnf9cWyDc5KFNi/6g+HdT9bw1Xf5nHZCby49b1gDm2HI+nFHJKKzdcduthW4MZtVzjipb4O2jSUS0Zn2n4VszN/Fi49chMOxb9VlrTdEOBwhK3PfqJQ8/JVFDsgbH6yixhvixitH1R+r9QTZUeBmUP9cEGBKwsQUyezeJAMFxdVcf+dHLFy6nef/ecE+gl+3uZwaT7D++y8X5nPR5Fn84+lv+Ob7bQ3aNpYVa4o595rpLF25i7v+OHa/gp+7YBPjfvMy2wv3dcmKdtVQVe0HJJ/N34gnwTVBoZBG/AvRlWpj2OBOmEwKJlUhohkJ/7mJoE2KPqLplFV49lvGEAprLF9dzN0Pf8EZl72KJnWm/fms+GbousHcBZsaHOvdPZM7bxrLK/+6mCnXjmlgO1gims6j/13INbe+z4QzBvPp65cxbOC+q6x9NHcd/3x6IeNP7svI4ftOD/x6UT52u4WN+RXc9sAXbC90xzc5LMwWFYf9wDmKj79cz11TPyecZJvf0VbdmzUbSrns+jfI6uCgc+d0UhxmDF1SWe2nqLgaX8hMpkvllt//ikvOG9rg3Eq3nxpPgA4ZTu6aOofH7z8Xe4I2Pf52yXamPvk/LBaFh+8Zx9AB0TXfff4w1r0yzCtWFzFnwWb+8NvRZKTtm5kOhXVemLGEmyePodYT5IdVhZwypk+DZN/+2F5QxfcrCtmwuYLhgzpy8bkH3j7no3nrycp0MGY/2ejla4r5aO56zj1jAMcdlXwrpbXanj4Y0iir8MQfhtiOIHl5LhTVxLJVxXy7pIiFPxRQUFzNqBE9eOQvpzD/3cn7CB5gzoJNFO+qRSAwDAOzad9Bb2OQUrJ42U6u+dNsrrvrU04Z3ZP3X7yiXvChUPTNUzfTsdYTYlthFX/5v1P3K3iAikov1tig15Vq4/QT+xIOa/z90S958ImvmTV7Nes2l8WfxmdfbeTxF75l5foSIvrP1zX5AxF6dN2TyNtRWMUjz37Hb2/9iNmfrePvt56WlIKnNff0G7aU47Cb6d4lI97Et0u2U17p4cKzhlJR6SMQjGC1qKS57DjsZiIRnfJKH3kdXWzdUcnuKj+jjonewHumzeXCs4bQs2sGD/57Pk9OPb/BZ7urA8z/bhu9emTQu1smaa6GwpRSsrvKx87iGpavKuK9z9ZSXKHTs7OF++44nZHDu7B42U4y0uwM7JvD+s1lhCM6Rw2OujhzF2xm3v+28JcpYxsMXgtLajAMg+5dMlj2UxGrN5byu9+MwOcP8/Iby+nZPYOsTDv/eXUJm/Ir+fC1SeR1bFgRWlxai88Xolf3TBRF2W92demKAp58+QdOGdONay8fiRCCz+dv4k/3fY5q7YBN9fDp9CuTutq0VYpe1w0WL9vJ6BHd91va+sW3WzCpSoP6nb357ocdDOqXS7rLxjW3vMuK1SX8OO8mbFYTDz7xNddeMZKKSh/fLN7KlMlj+HDOWnp1y2TY4M5cOeUdVqwPooXdpLvMdM5JxaKqoEavy+MLsrOwBkwpKEKhS46J6648jgvPGlQvsj9Pm8vlvz6KoQM78tHc9Yw/pV99uPLJlxbx0nsljD3WzDMPTai/5jlfb6J/72x6dc/ki/9tZmN+BVMmj2HpykLe+XgN548fyIC+2bz1wUouv+BogkGt0VWQi37cwdwFm8nrnMlVFw3HYTczf2E+/3puIZMuPoYeXTPo0snV6M9tbvZVRCugtMJLRaVvv4IHKC6pYXC//cfaS8pq8frCZKbb0XQDRREcf2zX+th9XkcXnXJSKd/t5cxT+pO/o5K7p/2PPz/yBS/O+oG8Ti565hlgGNR4JBu3B1i7zc+azV7WbPawvcBLn+6ZXHxmT156ZByfz7qai88ZXC/4cERn284qOuWmsKvcg8WiNojPn3hcT/p0kQ3KqjVNp3y3r15s/kCEL77Np6C4miXLd/KrEd349MsNzHxvJZdNOJqcDik8+fJ3fP71Zmpq90Sf9kbXDSrdflatK+GDOeu47o6PmPH+Sv5+2+ncMGkEDruZguJqZry3kleeuJgrLhjO6BHdkl7wtNaefsXqItZuLuOqi/ddmHTF6iK+/n4bt19/UrwJYq5PRpqNoQOj2V1dNwiGNJwOCwVF1Xy5cAuTLx9JYUk1XTun89hz3/LKu9tA1jL1jlO58KwhaLpB/o5Kdlf68PhCSEm9+5Sd6aR7lwMLw++PcPNfP+L5Ry/i64X5dMi0c+ywhtGZyiof8xZs4oqLoruCzJy9kvLdXm69LrqV5Q+rCrnq/z7BZjYIaWbsthC/vWQE114+EocjOug+7+rX2Vqok2IPkJPlxOWwoqgCQ5cEQhGq3AEqqnwYwokQCscOdvHkg+fVV1BK4M8Pz2HCmUMYdXRy+u4HYv9d4RGOL6DxwZz1+P0Nw2UrVpcw9Yn5TBg3uMHxvfl+eQGpKXtCcaqq4IzFyJ95bTFDYgPMrp2jwv3dZSOZ+OueTL70KC48KxrtMKkKA3pnc8JxPTjrlP6cfWp/TjuhDyOG5f2s4AF8gTAdMu2YVMHGbeWkOveNz8+es5YBfaNlGe98vJoXZ/7AJefuGXQPH9SJ0UfnEIyonDQqhy/e+B1TJo+uFzzAjVePwunU8PgE2wpCrNroYcX6GlZuqGZ9fjVV7gD9+2Rz6bl9eGHaGcx85jcNSobf+mAV3btkHnGCp7X29NsKqjjnyll065LKGSf2wmxSWL2hjEXLSrnjhuOYfPlISss9RDSdpSsKOP3EvqTHiswuu/FNhg/uzD037UmhF++q4YHHF2CxCJ6e+uu9fhJszC9n+jvLufG3o+naOa2B7VDYsKWMdZsruPicIdxy7yeYTSp33XQymel2Kqu8vPTWCtZs2MWMpy7lm8XbmPe/LVx7xUj69cpq8DmRiE5xqZceXQ98TRWVHrburCYUinYOqqpgsah0SHfSIdNBetwgvI753+Xz/bIC7r755KTNuv4crVL0mmYw8cZZrN0uo6uSCRWMENdeMYhbf38CANfc8i47Smopq6hm9otXMSA21e/P/5jLh18VM7iPjZ5d09ntDrBoWQmdcu18+NKk+ofD74/w1XdbWLqikPPHDWTUMd0aXMOhsqPIjSvFSma6g8dfWMhLb2/DYfKQne1kR7EHXZe8/8JlDBmQi88frn8LNQdSSj6at56dRdVcN/E47PbE5Ceam1YpeoBdZbX8d8YPbNtRSbe8DH49fkADYb72znKyMp3k5aYydGA0dQ6Qv72Sq256m+qgAyHA0MOMPrYD/7h7HLlZeyoKa70hdu/20avHgSedHC7FpTVcf9cHbN0ZQmLQvYuDB287leNawKWo9YRYvGwHihCMO/nI3oeq1Yr+cCgurWHBoh0EQyGGDerUokkWfzDCmg1lWEwKQwbmYE7UPleNpKo6gBDsd67BkUa76Ntpcxx5o5B22jlM2kXfTpujXfTttDnaRd9Om6Nd9O20OdpF306bo1307bQ52kXfTpujXfTttDnaRd9Om6Nd9O20OdpF306b4/8BgwXbYuuG85EAAAAASUVORK5CYII=';

interface AuthScreenProps { users: User[]; onLogin: (user: User) => void; }

export const AuthScreen: React.FC<AuthScreenProps> = ({ users, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [shake, setShake]       = useState(false);
  const [loading, setLoading]   = useState(false);
  const [focusedField, setFocusedField] = useState<string|null>(null);
  const [tick, setTick]         = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);

  /* ── Particle canvas ── */
  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return;
    const ctx = cv.getContext('2d')!;
    const resize = () => { cv.width = window.innerWidth; cv.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    type Pt = { x:number;y:number;vx:number;vy:number;r:number;c:string;a:number;phase:number; };
    const colors = ['#6366f1','#818cf8','#06b6d4','#67e8f9','#10b981','#34d399','#a855f7'];
    const pts: Pt[] = Array.from({length:70}, () => ({
      x: Math.random()*cv.width, y: Math.random()*cv.height,
      vx:(Math.random()-.5)*.45, vy:(Math.random()-.5)*.45,
      r: Math.random()*2+.5,
      c: colors[Math.floor(Math.random()*colors.length)],
      a: Math.random(), phase: Math.random()*Math.PI*2
    }));
    let t = 0;
    const draw = () => {
      t += .005;
      ctx.clearRect(0,0,cv.width,cv.height);
      for (let i=0;i<pts.length;i++) {
        const p = pts[i];
        p.x += p.vx; p.y += p.vy; p.a = .15+.15*Math.sin(t*2+p.phase);
        if (p.x<0||p.x>cv.width) p.vx*=-1;
        if (p.y<0||p.y>cv.height) p.vy*=-1;
        for (let j=i+1;j<pts.length;j++) {
          const q = pts[j], dx=p.x-q.x, dy=p.y-q.y, d=Math.sqrt(dx*dx+dy*dy);
          if (d<130) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(99,102,241,${.06*(1-d/130)})`;
            ctx.lineWidth = .5;
            ctx.moveTo(p.x,p.y); ctx.lineTo(q.x,q.y); ctx.stroke();
          }
        }
        ctx.beginPath();
        ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle = p.c + Math.round(p.a*255).toString(16).padStart(2,'0');
        ctx.fill();
      }
      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener('resize',resize); };
  }, []);

  /* ── Live clock ── */
  useEffect(() => { const t = setInterval(() => setTick(n=>n+1),1000); return () => clearInterval(t); },[]);
  const now = new Date();
  const timeStr = now.toLocaleTimeString('fa-IR',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
  const dateStr = now.toLocaleDateString('fa-IR',{weekday:'long',year:'numeric',month:'long',day:'numeric'});

  const handleLogin = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r,700));
    const u = users.find(x => x.username===username && x.password===password);
    if (u) { onLogin(u); }
    else {
      setShake(true); setLoading(false);
      setTimeout(() => setShake(false), 600);
    }
  };

  const inputStyle = (key:string): React.CSSProperties => ({
    width:'100%', boxSizing:'border-box',
    background: focusedField===key ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.04)',
    border: `1px solid ${focusedField===key ? 'rgba(99,102,241,0.55)' : 'rgba(255,255,255,0.1)'}`,
    borderRadius:16, padding:'16px 20px', color:'#fff',
    fontFamily:'Vazirmatn,sans-serif', fontSize:'14px', fontWeight:700,
    textAlign:'center', outline:'none', transition:'all .25s',
    boxShadow: focusedField===key ? '0 0 24px rgba(99,102,241,0.18), inset 0 0 12px rgba(99,102,241,0.06)' : 'none',
  });

  return (
    <div style={{minHeight:'100vh',background:'#010409',display:'flex',alignItems:'center',justifyContent:'center',position:'relative',overflow:'hidden',fontFamily:'Vazirmatn,sans-serif',direction:'rtl'}}>
      <style>{`
        @keyframes authCardIn { from{opacity:0;transform:translateY(40px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes authFloat  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes authShake  { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-12px)} 40%{transform:translateX(12px)} 60%{transform:translateX(-7px)} 80%{transform:translateX(7px)} }
        @keyframes authConicSpin { from{transform:translate(-50%,-50%) rotate(0deg)} to{transform:translate(-50%,-50%) rotate(360deg)} }
        @keyframes authPulse  { 0%,100%{box-shadow:0 0 20px rgba(99,102,241,.3)} 50%{box-shadow:0 0 50px rgba(99,102,241,.7),0 0 80px rgba(6,182,212,.25)} }
        @keyframes authScan   { 0%{top:0%} 100%{top:105%} }
        @keyframes authGlow   { 0%,100%{opacity:.4} 50%{opacity:1} }
        @keyframes authSpinBtn{ from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .auth-card { animation: authCardIn .7s cubic-bezier(.34,1.56,.64,1) both, authFloat 6s ease-in-out 1s infinite; }
        .auth-card.shake { animation: authShake .5s ease !important; }
      `}</style>

      {/* Canvas */}
      <canvas ref={canvasRef} style={{position:'fixed',inset:0,zIndex:0}} />

      {/* Glow blobs */}
      <div style={{position:'fixed',top:'18%',left:'10%',width:450,height:450,background:'radial-gradient(circle,rgba(99,102,241,.07) 0%,transparent 70%)',zIndex:1,pointerEvents:'none'}} />
      <div style={{position:'fixed',bottom:'15%',right:'8%',width:380,height:380,background:'radial-gradient(circle,rgba(6,182,212,.06) 0%,transparent 70%)',zIndex:1,pointerEvents:'none'}} />
      <div style={{position:'fixed',top:'50%',left:'50%',width:500,height:500,background:'radial-gradient(circle,rgba(168,85,247,.04) 0%,transparent 70%)',transform:'translate(-50%,-50%)',zIndex:1,pointerEvents:'none'}} />

      {/* Watermark logo */}
      <div style={{position:'fixed',inset:0,zIndex:1,display:'flex',alignItems:'center',justifyContent:'center',pointerEvents:'none'}}>
        <img src={LOGO_URI} alt="" style={{width:'60%',maxWidth:600,opacity:.035,filter:'grayscale(100%) blur(1px)',userSelect:'none'}} />
      </div>

      {/* Clock top-right */}
      <div style={{position:'fixed',top:24,left:24,zIndex:10,textAlign:'center'}}>
        <div style={{background:'rgba(10,12,24,.7)',backdropFilter:'blur(20px)',border:'1px solid rgba(99,102,241,.2)',borderRadius:16,padding:'12px 20px'}}>
          <div style={{fontSize:'22px',fontWeight:900,color:'#a5b4fc',letterSpacing:'.05em',fontVariantNumeric:'tabular-nums'}}>{timeStr}</div>
          <div style={{fontSize:'10px',color:'rgba(255,255,255,.3)',fontWeight:700,marginTop:4}}>{dateStr}</div>
        </div>
      </div>

      {/* Login card */}
      <div className={`auth-card${shake?' shake':''}`} style={{position:'relative',zIndex:10,width:'100%',maxWidth:440,padding:'0 20px'}}>
        <div style={{
          background:'rgba(8,10,20,.88)',
          backdropFilter:'blur(48px)',
          border:'1px solid rgba(99,102,241,.22)',
          borderRadius:40, padding:'52px 44px',
          boxShadow:'0 0 100px rgba(99,102,241,.12), 0 50px 130px rgba(0,0,0,.65)',
          position:'relative', overflow:'hidden', textAlign:'center',
        }}>
          {/* Conic rotating border */}
          <div style={{position:'absolute',top:'50%',left:'50%',width:'180%',height:'180%',
            background:'conic-gradient(from 0deg,transparent 0deg,rgba(99,102,241,.14) 60deg,rgba(6,182,212,.1) 120deg,transparent 180deg,rgba(168,85,247,.1) 240deg,transparent 360deg)',
            animation:'authConicSpin 10s linear infinite',zIndex:0,pointerEvents:'none'}} />
          {/* Scan line */}
          <div style={{position:'absolute',left:0,right:0,height:2,background:'linear-gradient(90deg,transparent,rgba(99,102,241,.5),rgba(6,182,212,.3),transparent)',animation:'authScan 3.5s linear infinite',zIndex:1,pointerEvents:'none'}} />
          {/* Top accent line */}
          <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:'linear-gradient(90deg,transparent,#6366f1,#06b6d4,#a855f7,transparent)',zIndex:2}} />

          <div style={{position:'relative',zIndex:2}}>
            {/* Logo */}
            <div style={{position:'relative',width:120,height:120,margin:'0 auto 28px'}}>
              <div style={{position:'absolute',inset:-14,borderRadius:'50%',border:'1px solid rgba(99,102,241,.2)',animation:'authGlow 2.5s ease-in-out infinite'}} />
              <div style={{position:'absolute',inset:-26,borderRadius:'50%',border:'1px solid rgba(6,182,212,.1)',animation:'authGlow 2.5s ease-in-out .8s infinite'}} />
              <div style={{width:120,height:120,borderRadius:'50%',background:'#fff',overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center',
                animation:'authPulse 3s ease-in-out infinite',
                border:'2px solid rgba(99,102,241,.35)',position:'relative',zIndex:2}}>
                <img src={LOGO_URI} alt="استوان کیش" style={{width:'82%',height:'82%',objectFit:'contain'}} />
              </div>
            </div>

            {/* Brand */}
            <h1 style={{fontSize:'18px',fontWeight:900,color:'#fff',letterSpacing:'.06em',margin:'0 0 6px'}}>شرکت مهاری استوان کیش</h1>
            <p style={{fontSize:'10px',color:'rgba(99,102,241,.9)',fontWeight:900,letterSpacing:'.3em',textTransform:'uppercase',margin:'0 0 6px'}}>P21 WAREHOUSE · ULTRA V4</p>
            <p style={{fontSize:'10px',color:'rgba(255,255,255,.2)',fontWeight:700,margin:0}}>سیستم مدیریت هوشمند انبار</p>

            <div style={{width:70,height:2,background:'linear-gradient(90deg,transparent,#6366f1,#06b6d4,transparent)',margin:'20px auto 32px'}} />

            {/* Fields */}
            <div style={{display:'flex',flexDirection:'column',gap:14,marginBottom:22}}>
              <div>
                <label style={{display:'block',fontSize:'9px',fontWeight:900,color:'rgba(255,255,255,.25)',letterSpacing:'.25em',textTransform:'uppercase',marginBottom:6}}>نام کاربری</label>
                <input type="text" value={username} onChange={e=>setUsername(e.target.value)}
                  onFocus={()=>setFocusedField('u')} onBlur={()=>setFocusedField(null)}
                  onKeyDown={e=>e.key==='Enter'&&handleLogin()}
                  placeholder="username" style={inputStyle('u')} />
              </div>
              <div>
                <label style={{display:'block',fontSize:'9px',fontWeight:900,color:'rgba(255,255,255,.25)',letterSpacing:'.25em',textTransform:'uppercase',marginBottom:6}}>گذرواژه</label>
                <input type="password" value={password} onChange={e=>setPassword(e.target.value)}
                  onFocus={()=>setFocusedField('p')} onBlur={()=>setFocusedField(null)}
                  onKeyDown={e=>e.key==='Enter'&&handleLogin()}
                  placeholder="••••••••" style={inputStyle('p')} />
              </div>
            </div>

            {/* Button */}
            <button onClick={handleLogin} disabled={loading}
              style={{
                width:'100%', padding:'18px', borderRadius:18,
                background: loading ? 'rgba(99,102,241,.3)' : 'linear-gradient(135deg,#6366f1 0%,#4f46e5 50%,#7c3aed 100%)',
                border:'1px solid rgba(255,255,255,.15)', color:'#fff',
                fontFamily:'Vazirmatn,sans-serif', fontWeight:900, fontSize:'14px',
                letterSpacing:'.15em', textTransform:'uppercase', cursor: loading ? 'not-allowed':'pointer',
                transition:'all .25s', boxShadow:'0 8px 35px rgba(99,102,241,.35)',
                display:'flex', alignItems:'center', justifyContent:'center', gap:10,
              }}
              onMouseEnter={e=>{if(!loading)(e.currentTarget as HTMLElement).style.boxShadow='0 12px 45px rgba(99,102,241,.55)';}}
              onMouseLeave={e=>{if(!loading)(e.currentTarget as HTMLElement).style.boxShadow='0 8px 35px rgba(99,102,241,.35)';}}
            >
              {loading
                ? <><span style={{width:16,height:16,border:'2px solid rgba(255,255,255,.3)',borderTop:'2px solid #fff',borderRadius:'50%',display:'inline-block',animation:'authSpinBtn .7s linear infinite'}} /> احراز هویت...</>
                : '⚡ ورود به سیستم'}
            </button>

            <p style={{marginTop:20,fontSize:'9px',color:'rgba(255,255,255,.15)',fontWeight:700,letterSpacing:'.2em',textTransform:'uppercase'}}>
              © استوان کیش · P21 ULTRA · تمام حقوق محفوظ است
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
